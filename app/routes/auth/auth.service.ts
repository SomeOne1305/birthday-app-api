import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import useragent from "useragent";
import Mailer from "../../../mail/mailer";
import { Session } from "../../../models/session.model";
import { User } from "../../../models/user.model";
import type {
	ChangePassDto,
	CreateUserDto,
	FillUserDto,
	VerifyUserDto,
	loginDto,
} from "../../../schemas/auth.schema";
import { createToken } from "../../../utils/generate-token";
import { getIPInfo } from "../../../utils/get-ip-info";
import { hashPassword, verifyPassword } from "../../../utils/hashing-utils";

const REFRESH_SECRET_CODE = process.env.REFRESH_SECRET!;
const ACCESS_SECRET_CODE = process.env.ACCESS_SECRET!;

interface RefreshTokenPayload extends JwtPayload {
	id: string;
}

export const AuthService = {
	async createUser(data: CreateUserDto, res: Response) {
		try {
			const token = createToken();
			const user = await User.findOne({
				email: data.email,
			});
			if (user && user.isVerified)
				return res.status(400).jsend.fail({
					code: 400,
					message: "User had already been registered !",
				});
			if (!user) {
				await User.create({
					...data,
					last_name: "NULL",
					first_name: "NULL",
					isVerified: false,
					verification_token: token,
					valid_for: Date.now() + 1800000,
					password: "NOT_SET",
					pass_salt: "NO_SALT",
				});
			}
			await user?.updateOne(
				{ $set: { verification_token: token } },
				{ new: true },
			);
			await Mailer.sendMail({
				to: data.email,
				from: `"Birthmark" <${process.env.MAILER_USER}>`, // ✅ valid sender
				subject: "Please verify your account",
				html: `<a href="http://localhost:4000/verify/${token}">Please verify</a>`,
			});
		} catch (error) {
			throw error;
		}
	},

	async verifyUser({ token }: VerifyUserDto, res: Response) {
		try {
			const user = await User.findOne({
				verification_token: token,
				valid_for: { $gt: Date.now() },
			});

			if (!user)
				return res
					.status(400)
					.jsend.fail({ code: 400, message: "Invalid or expired token" });
			const new_token = createToken(16);
			user.isVerified = true;
			user.verification_token = new_token;
			user.valid_for = undefined;
			await user.save();
			res.status(200).jsend.success({
				code: 200,
				message: "Successfully verified !",
				data: { token: new_token },
			});
		} catch (error) {
			throw error;
		}
	},

	async fill_user(dto: FillUserDto, req: Request, res: Response) {
		try {
			const { token, password, ...data } = dto;
			const user = await User.findOne({
				isVerified: true,
				verification_token: dto.token,
				valid_for: undefined,
			});
			if (!user)
				return res.status(400).jsend.fail({
					code: 400,
					message: "Error occured on dealing with user",
				});

			const { hash, salt } = hashPassword(password);
			const update = {
				...data,
				password: hash,
				pass_salt: salt,
				verification_token: undefined,
			};

			await user.updateOne({
				$set: update,
				$unset: { verification_token: "" },
			});

			await user.save();
			const PAYLOAD = {
				id: user._id.toString(),
			};
			const accessToken = jwt.sign(PAYLOAD, ACCESS_SECRET_CODE, {
				expiresIn: "15m",
			});
			const refreshToken = jwt.sign(PAYLOAD, REFRESH_SECRET_CODE, {
				expiresIn: "7d",
			});

			const ip =
				(req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
				req.socket.remoteAddress ||
				"";
			const agent = useragent.parse(req.headers["user-agent"] || "");
			const deviceName = `${agent.family} ${agent.major}`;
			const deviceId = req.headers["user-agent"] || "";
			const ipData = await getIPInfo(ip);
			if (ipData) {
				await Session.create({
					device_name: deviceName,
					device_id: deviceId,
					refresh: refreshToken,
					user: user._id,
					...ipData,
				});
			}
			const updatedUser = await User.findById(user._id);
			const { _id, first_name, last_name, email, createdAt, updatedAt } =
				updatedUser!;
			res.cookie("refresh_token", refreshToken, {
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite: "strict",
				httpOnly: true,
				secure: true,
			});
			res.status(200).jsend.success({
				code: 200,
				message: "User's data is ready !",
				data: {
					_id,
					first_name,
					last_name,
					email,
					access_token: accessToken,
					createdAt,
					updatedAt,
				},
			});
		} catch (error) {
			throw error;
		}
	},

	async log_in(dto: loginDto, req: Request, res: Response) {
		try {
			const user = await User.findOne({ email: dto.email });
			if (!user) {
				res
					.status(400)
					.jsend.fail({ code: 400, message: "Invalid credentials" });
				return;
			}

			const { pass_salt, password: hashedPassword } = user;

			const isCorrectPass = verifyPassword(
				dto.password,
				pass_salt!,
				hashedPassword,
			);

			if (!isCorrectPass) {
				res
					.status(400)
					.jsend.fail({ code: 400, message: "Invalid credentials" });
				return;
			}

			// Extract IP from headers or socket
			const ip =
				(req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
				req.socket.remoteAddress ||
				"";

			// Parse user agent info
			const agent = useragent.parse(req.headers["user-agent"] || "");
			const deviceName = `${agent.family} ${agent.major}`;
			const deviceId = req.headers["user-agent"] || "";

			// Fetch IP-related data (geo info etc.)
			const ipData = await getIPInfo(ip);
			console.log(ip);

			// Look for existing session with same user and IP
			let session = await Session.findOne({ user: user._id, ip_add: ip });

			const PAYLOAD = { id: user._id.toString() };
			const accessToken = jwt.sign(PAYLOAD, ACCESS_SECRET_CODE, {
				expiresIn: "15m",
			});
			const refreshToken = jwt.sign(PAYLOAD, REFRESH_SECRET_CODE, {
				expiresIn: "7d",
			});

			// Create session if none exists for this user+IP
			if (!session) {
				if (ipData) {
					session = await Session.create({
						...ipData,
						device_name: deviceName,
						device_id: deviceId,
						refresh: refreshToken,
						user: user._id,
						ip_add: ip,
					});
				}
			} else {
				// Update refresh token in existing session ONLY for this IP
				await Session.updateOne(
					{ _id: session._id },
					{ refresh: refreshToken },
				);
			}

			// Set refresh token cookie
			res.cookie("refresh_token", refreshToken, {
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite: "strict",
				httpOnly: true,
				secure: true,
			});

			const { _id, first_name, last_name, email, createdAt, updatedAt } = user;

			res.status(200).jsend.success({
				code: 200,
				message: "User's data is ready!",
				data: {
					_id,
					first_name,
					last_name,
					email,
					access_token: accessToken,
					createdAt,
					updatedAt,
				},
			});
		} catch (error) {
			throw error;
		}
	},
	async refresh_user_token(req: Request, res: Response) {
		try {
			const token = req.cookies?.["refresh_token"];
			if (!token)
				return res
					.status(400)
					.jsend.fail({ code: 400, message: "Unauthorized access" });
			jwt.verify(
				token,
				REFRESH_SECRET_CODE,
				async (
					err: jwt.VerifyErrors | null,
					decoded: JwtPayload | string | undefined,
				) => {
					if (err) {
						return res.status(403).jsend.fail({
							code: 403,
							message: "Bad request",
							details: err.message,
						});
					}

					const payload = decoded as RefreshTokenPayload;
					const session = await Session.findOne({
						user: payload.id,
					});
					if (!session || session.refresh !== token) return res.status(400).clearCookie("refresh_token");
					const accessToken = jwt.sign({ id: payload.id }, ACCESS_SECRET_CODE, {
						expiresIn: "15m",
					});

					return res.status(200).jsend.success({
						code: 200,
						message: "Token refreshed successfully",
						data: {
							access_token: accessToken,
						},
					});
				},
			);
		} catch (error) {
			throw error;
		}
	},

	async forgot_password({ email }: { email: string }, res: Response) {
		try {
			const user = await User.findOne({
				email,
			});
			if (!user)
				return res.status(404).jsend.fail({
					code: 404,
					message: "User not found with this credential",
				});
			const token = createToken(24);
			await user.updateOne(
				{
					$set: { verification_token: token },
				},
				{ new: true },
			);
			await Mailer.sendMail({
				to: email,
				from: `"Birthmark" <${process.env.MAILER_USER}>`, // ✅ valid sender
				subject: "Reset password",
				html: `<a href="http://localhost:4000/reset/${token}">Please click link</a>`,
			});
			res.status(200).jsend.success({
				code: 200,
				message: "Reset link is sent to " + email,
			});
		} catch (error) {
			throw error;
		}
	},

	async change_password(dto: ChangePassDto, res: Response) {
		try {
			const user = await User.findOne({
				verification_token: dto.token,
			});
			if (!user)
				return res
					.status(400)
					.jsend.fail({ code: 400, message: "Invalid token" });
			const { salt, hash } = hashPassword(dto.password);
			await user.updateOne(
				{
					$set: {
						password: hash,
						pass_salt: salt,
						verification_token: "",
					},
				},
				{ new: true },
			);
			res.status(200).jsend.success({
				code: 200,
				message: "Password changed successfully ",
			});
		} catch (error) {
			throw error;
		}
	},

	async log_out(req: Request, res: Response) {
		try {
			const refresh_token = req.cookies?.["refresh_token"];
			if (!refresh_token)
				return res.status(400).jsend.fail({
					code: 400,
					message: "Invalid or expired token request",
				});
			jwt.verify(
				refresh_token,
				REFRESH_SECRET_CODE,
				async (
					err: jwt.VerifyErrors | null,
					decoded: JwtPayload | string | undefined,
				) => {
					if (err)
						return res.status(403).jsend.fail({
							code: 403,
							message: "Bad request",
							details: err.message,
						});
					const payload = decoded as RefreshTokenPayload;
					await Session.findOneAndDelete({
						user: payload.id,
					});
					res.clearCookie("refresh_token");
					res
						.status(200)
						.jsend.success({ code: 200, message: "Logged out successfully !" });
				},
			);
		} catch (error) {
			throw error;
		}
	},
};
