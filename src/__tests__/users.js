const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const APIController = require("../../controller/APIController/usersController");
const User = require("../../model/User");
const Address = require("../../model/Address");
const { serverErrorMessage, responseMessage } = require("../../services/utils");
const {
  findUserById,
  encryptPassword,
  updateUserFields,
  deleteUserFields,
} = require("../../services/userUtils");
const {
  findAddressById,
  createAddress,
  updateAddress,
} = require("../../services/addressUtils");
const verifyJWT = require("../../middleware/verifyJWT");
const verifyRoles = require("../../middleware/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");

// Mock middleware
jest.mock("../../middleware/verifyJWT", () =>
  jest.fn((req, res, next) => {
    req.user = "testuser@example.com";
    req.roles = [ROLES_LIST.Admin]; // Simulate Admin role (5919)
    next();
  })
);
jest.mock(
  "../../middleware/verifyRoles",
  () =>
    (...allowedRoles) =>
    (req, res, next) => {
      if (
        !req.roles ||
        !allowedRoles.some((role) => req.roles.includes(role))
      ) {
        return res.sendStatus(401);
      }
      next();
    }
);

// Mock errorHandler
const errorHandler = jest.fn((err, req, res, next) => {
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Mock Mongoose models and utility functions
jest.mock("../../model/User");
jest.mock("../../model/Address");
jest.mock("../../services/userUtils");
jest.mock("../../services/addressUtils");
jest.mock("../../services/utils");

// Mock Express app with correct routes
const app = express();
app.use(express.json());
app.get("/api/users", verifyRoles(ROLES_LIST.Admin), APIController.getAllUser);
app.put("/api/users", APIController.updateUser);
app.delete(
  "/api/users",
  verifyRoles(ROLES_LIST.Admin),
  APIController.deleteUser
);
app.get("/api/users/:id", APIController.getUser);
app.get(
  "/api/users/role/:role",
  verifyRoles(ROLES_LIST.Admin),
  APIController.countUserRoles
);
app.put(
  "/api/users/suspend",
  verifyRoles(ROLES_LIST.Admin),
  APIController.suspendUser
);
app.use(errorHandler);

describe("APIController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUser", () => {
    it("should return all users and count", async () => {
      const mockUsers = [
        { _id: "1", username: "user1", email: "user1@example.com" },
        { _id: "2", username: "user2", email: "user2@example.com" },
      ];
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });
      User.countDocuments.mockResolvedValue(2);

      const res = await request(app).get("/api/users");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ count: 2, users: mockUsers });
      expect(User.find).toHaveBeenCalled();
      expect(User.countDocuments).toHaveBeenCalled();
      expect(verifyRoles).toHaveBeenCalledWith(ROLES_LIST.Admin);
    });

    it("should handle server error", async () => {
      const error = new Error("Database error");
      User.find.mockReturnValue({ select: jest.fn().mockRejectedValue(error) });
      serverErrorMessage.mockImplementation((res, err) =>
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" })
      );

      const res = await request(app).get("/api/users");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: "Internal Server Error",
      });
      expect(serverErrorMessage).toHaveBeenCalledWith(expect.anything(), error);
    });
  });

  describe("updateUser", () => {
    it("should update user with password and address", async () => {
      const mockUser = {
        _id: "1",
        username: "user1",
        password: "oldHash",
        address: "addressId",
        save: jest.fn().mockResolvedValue(true),
      };
      const mockAddress = { _id: "addressId", street: "123 Main St" };
      const updatedUser = { _id: "1", username: "user1", address: mockAddress };

      findUserById.mockResolvedValue(mockUser);
      findAddressById.mockResolvedValue(mockAddress);
      updateAddress.mockResolvedValue(mockAddress);
      encryptPassword.mockResolvedValue("newHash");
      updateUserFields.mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) }),
      });

      const res = await request(app)
        .put("/api/users")
        .send({
          id: "1",
          password: "newPassword",
          address: { street: "123 Main St" },
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedUser);
      expect(findUserById).toHaveBeenCalledWith("1");
      expect(encryptPassword).toHaveBeenCalledWith("newPassword");
      expect(updateAddress).toHaveBeenCalled();
    });

    it("should return 400 if id is missing", async () => {
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app).put("/api/users").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "User ID is required.",
      });
    });

    it("should return 403 if username is provided", async () => {
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app)
        .put("/api/users")
        .send({ id: "1", username: "newUser" });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: "You can not change your username.",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const mockUser = { _id: "1", username: "user1" };
      findUserById.mockResolvedValue(mockUser);
      deleteUserFields.mockResolvedValue({ deletedCount: 1 });

      const res = await request(app).delete("/api/users").send({ id: "1" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ deletedCount: 1 });
      expect(findUserById).toHaveBeenCalledWith("1");
      expect(deleteUserFields).toHaveBeenCalledWith("1");
      expect(verifyRoles).toHaveBeenCalledWith(ROLES_LIST.Admin);
    });

    it("should return 400 if user not found", async () => {
      findUserById.mockResolvedValue(null);
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app).delete("/api/users").send({ id: "1" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, message: "User not found." });
    });
  });

  describe("getUser", () => {
    it("should return user by id", async () => {
      const mockUser = {
        _id: "1",
        username: "user1",
        email: "user1@example.com",
      };
      User.findOne.mockReturnValue({
        select: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
      });

      const res = await request(app).get("/api/users/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ _id: "1" });
    });

    it("should return 400 if id is invalid", async () => {
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app).get("/api/users/invalid");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid ID: invalid provided.",
      });
    });
  });

  describe("countUserRoles", () => {
    it("should return count and users for valid role", async () => {
      const mockUsers = [{ _id: "1", username: "user1", roles: "2000" }];
      User.countDocuments.mockResolvedValue(1);
      User.find.mockReturnValue({
        select: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUsers) }),
      });

      const res = await request(app).get("/api/users/role/2000");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ count: 1, users: mockUsers });
      expect(User.countDocuments).toHaveBeenCalledWith({ roles: "2000" });
      expect(verifyRoles).toHaveBeenCalledWith(ROLES_LIST.Admin);
    });

    it("should return 400 for invalid role", async () => {
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app).get("/api/users/role/9999");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid role: 9999. Valid roles are 2000, 1995, 5919.",
      });
    });
  });

  describe("suspendUser", () => {
    it("should suspend user successfully", async () => {
      const mockUser = {
        _id: "1",
        username: "user1",
        isSuspended: false,
        save: jest.fn().mockResolvedValue(true),
      };
      findUserById.mockResolvedValue(mockUser);
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app)
        .put("/api/users/suspend")
        .send({ id: "1", isSuspended: true });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "User: user1 has been suspended",
      });
      expect(mockUser.isSuspended).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(verifyRoles).toHaveBeenCalledWith(ROLES_LIST.Admin);
    });

    it("should unsuspend user successfully", async () => {
      const mockUser = {
        _id: "1",
        username: "user1",
        isSuspended: true,
        save: jest.fn().mockResolvedValue(true),
      };
      findUserById.mockResolvedValue(mockUser);
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app)
        .put("/api/users/suspend")
        .send({ id: "1", isSuspended: false });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "User: user1 has been unsuspended",
      });
      expect(mockUser.isSuspended).toBe(false);
      expect(mockUser.save).toHaveBeenCalled();
      expect(verifyRoles).toHaveBeenCalledWith(ROLES_LIST.Admin);
    });

    it("should return 400 if user not found", async () => {
      findUserById.mockResolvedValue(null);
      responseMessage.mockImplementation((res, status, success, msg) =>
        res.status(status).json({ success, message: msg })
      );

      const res = await request(app)
        .put("/api/users/suspend")
        .send({ id: "1", isSuspended: true });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, message: "User not found." });
    });
  });
});
