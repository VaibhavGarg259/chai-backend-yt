import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  //get tweet in body
  // check // create // return
  const { content } = req.body;
  if (!tweet) {
    throw new ApiError(400, "Tweet content is required");
  }
  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfull"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  //   get user id in param
  // valid // user exist // get tweets // return
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  const tweets = await Tweet.find({ owner: userId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(201)
    .json(new ApiResponse(201, tweets, "Tweet fetched successfull"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  //   get tweet id in params
  // valid // find // update // return

  const { tweetId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Id");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  //   if (tweet.owner.toString() !== req.user._id.toString()) {
  //     throw new ApiError(403, "You are not authorized");
  //   }
  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user._id },
    { $set: { content: content.trim() } },
    { new: true },
  );
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet successfull updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  //  get tweet id
  // valid // exist // delete // returns
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Id");
  }
  const deleteTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });
  if (!deleteTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deleteTweet, "Tweet successfull delete"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
