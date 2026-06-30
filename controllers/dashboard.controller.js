import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // 1. Get logged-in user ID
  // 2. Count total videos
  // 3. Sum total views
  // 4. Count subscribers
  // 5. Count total likes(get all video id, store videoid map,show totalLike)
  // 6. Return stats
  const { _id } = req.user;
  if (!_id) {
    throw new ApiError(401, "User ID is required ");
  }
  //   const totalVideo = await Video.countDocuments(Video._id);
  const totalVideo = await Video.countDocuments({ owner: _id });
  const publicVideos = await Video.countDocuments({
    owner: _id,
    isPublished: true,
  });

  const views = await Video.aggregate([
    { $match: { owner: _id } },
    {
      $group: {
        _id: null,
        totalview: {
          $sum: "$views",
        },
      },
    },
  ]);
  const totalViews = views[0]?.totalview || 0;
  const totalSubscribers = await Subscription.countDocuments({ channel: _id });
  const video = await Video.find({
    owner: _id,
  }).select("_id");
  const videoIds = video.map((video) => video._id);
  const totalLike = await Like.countDocuments({ video: { $in: videoIds } });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVideo, totalViews, totalSubscribers, totalLike, publicVideos },
        "Channel stats fetched successfully",
      ),
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  // get channel id
  // check channelid
  // get video for channelid
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  const Allvideo = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        views: 1,
        createdAt: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, Allvideo, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
