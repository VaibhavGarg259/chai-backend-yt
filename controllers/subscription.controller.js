import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  // get channelId from req.params
  // check if channelId is valid ObjectId
  // check if channelId exists in User collection
  // check if subscriberId exists in User collection
  // check if subscription already exists in Subscription collection
  // if subscription exists, delete it and return success response
  // if subscription does not exist, create it and return success response
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }
  const user = await User.findById(channelId);
  if (!user) {
    throw new ApiError(404, "Channel not found");
  }
  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (subscription) {
    await subscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    const newSubscription = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // TODO: get subscriber list of a channel
  // get channelId from req.params
  // check if channelId is valid ObjectId
  // check if channelId exists in User collection
  // get all subscriptions with channelId and populate subscriber field
  // return success response with subscriber list
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  const user = await User.findById(channelId);
  if (!user) {
    throw new ApiError(401, "Channel not found");
  }

  const subscriberList = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username fullname avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriberList, "Subscribers fetched successfully"),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }
  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "Subscriber not found");
  }

  const channelList = await Subscription.find({
    subscriber: subscriberId,
  })
    .populate("channel", "username fullname avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, channelList, "Channels fetched successfull "));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
