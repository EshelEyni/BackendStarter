import { User } from "../../types/user.interface";
import { UserModel } from "./user.model";
import { APIFeatures, QueryString, filterObj } from "../../services/util.service";
import { Document } from "mongoose";

async function query(queryString: QueryString): Promise<User[]> {
  const features = new APIFeatures(UserModel.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = (await features.getQuery().exec()) as unknown as Document[];
  return users as unknown as User[];
}

async function getById(userId: string): Promise<User> {
  const user = await UserModel.findById(userId).exec();
  return user as unknown as User;
}

async function getByUsername(username: string): Promise<User> {
  const features = new APIFeatures(UserModel.find(), { username }).filter();
  const users = await features.getQuery().exec();
  const [user] = users;
  return user as unknown as User;
}

async function add(user: User): Promise<User> {
  const savedUser = await new UserModel(user).save();
  return savedUser as unknown as User;
}

async function update(id: string, user: User): Promise<User> {
  const allowedFields = ["username", "email", "fullname", "imgUrl", "email", "isApprovedLocation"];
  const filteredUser = filterObj(user, ...allowedFields);

  const updatedUser = await UserModel.findByIdAndUpdate(id, filteredUser, {
    new: true,
    runValidators: true,
  }).exec();
  return updatedUser as unknown as User;
}

async function remove(userId: string): Promise<User> {
  const userRemoved = await UserModel.findByIdAndRemove(userId).exec();
  return userRemoved as unknown as User;
}

async function removeAccount(userId: string): Promise<User> {
  const userRemoved = await UserModel.findByIdAndUpdate(userId, { active: false }).exec();
  return userRemoved as unknown as User;
}

export default {
  query,
  getById,
  getByUsername,
  add,
  update,
  remove,
  removeAccount,
};
