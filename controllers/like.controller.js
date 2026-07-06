import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  // get videoId
  // check videoid or valid
  // check if current user has already liked
  // if yes, remove the like
  // if no, add the like
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video unliked successfully"));
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  // get commentId
  // check commentid or valid
  // check if current user has already liked
  // if yes,remove like
  // if no, add like
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment ID is required");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "comment unliked successfully"));
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  //   get tweetId
  // check tweetId or valid
  // check if current user has already Liked
  // if yes,remove like
  // if no, add like
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "tweet unLiked successfully"));
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TO DO: get all liked videos
  //   get all liked videos by current user
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null },
  })
    .populate("video", "title thumbnail views createdAt")
    .sort({ createdAt: -1 })
    .filter((like) => like.video);

  if (likedVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No liked videos found"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully"),
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
