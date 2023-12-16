import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import day from "dayjs";

import dayjs from "dayjs";
// import { nanoid } from "nanoid";
// import { NotFoundError } from "../errors/customErrors.js";

// let jobs = [
//     {id : nanoid(),company : 'apple',position:'front-end'},
//     {id : nanoid(),company : 'google',position:'back-end'},
// ]

export const getAllJobs = async (req, res) => {
  // console.log(jobss);
  console.log(req.query);
  console.log(req.user);

  const {search,jobStatus,jobType,sort} = req.query;

  const queryObject = {
    createdBy : req.user.userId,
    // jobStatus,
  }

  if(search){
    // queryObject.position = req.query.search
    queryObject.$or = [
      {position : {$regex : search, $options : 'i'}},
      {company : {$regex : search , $options : 'i'}}
    ]
  }

  if(jobStatus && jobStatus !== 'all'){
    queryObject.jobStatus = jobStatus;
  }

  if(jobType && jobType !== 'all'){
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest : '-createdAt',
    oldest : 'createdAt',
    'a-z'  : 'position',
    'z-a' : '-position'
  }

  const sortKey = sortOptions[sort] || sortOptions.newest;

  const jobs = await Job.find(queryObject)/*.sort('position')*/.sort(sortKey).skip().limit();

  const totalJobs = await Job.countDocuments(queryObject);
  res.status(StatusCodes.OK).json({totalJobs, jobs });
};

export const createJob = async (req, res) => {
  // try{
  //     const {company,position} = req.body;
  // // if(!company || !position){
  // //     return res.status(400).json({msg:'please provide company and position'});
  // // }
  // // const id = nanoid();
  // // const job = {id,company,position};
  // // jobs.push(job);

  // const job = await Job.create('some');

  // res.status(200).json({jobs : job})
  // }catch(error){
  //     res.status(500).json({msg : 'server error'});
  // }
  req.body.createdBy = req.user.userId;
  const { company, position } = req.body;
  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({ job });
};

export const getJob = async (req, res) => {
  const { id } = req.params;
  // const job = jobs.find((job) => job.id === id);

  const job = await Job.findById(id);

  // if(!job){
  // throw new NotFoundError(`no job with id ${id}`)
  // throw new Error('something');
  // return res.status(404).json({msg : `no job with id ${id}`})
  // }

  res.status(StatusCodes.OK).json({ job });
};

export const updateJob = async (req, res) => {
  // const {company,position} = req.body;
  // if(!company || !position){
  //     return res.status(400).json({msg : 'please provide company and position'});
  // }

  const { id } = req.params;

  const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  console.log(updatedJob);
  // const job = jobs.find((job) => job.id === id);
  // if(!updatedJob){
  // throw new NotFoundError(`no job with id ${id}`)
  // return res.status(404).json({msg : `no job with id ${id}`});
  // }

  // job.company = company;
  // job.position = position;
  res.status(StatusCodes.OK).json({ msg: "job modified", job: updatedJob });
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;

  const removedJob = await Job.findByIdAndDelete(id);
  // const job = jobs.find((job) => job.id === id);
  console.log(removedJob);

  // if(!removedJob){
  // throw new NotFoundError(`no job with id ${id}`)
  // return res.status(404).json({msg : `no job with id ${id}`});
  // }

  // const newJobs = jobs.filter((job) => job.id !== id);
  // jobs = newJobs;
  res
    .status(StatusCodes.OK)
    .json({ msg: "Job deleted successfully", job: removedJob });
};

export const showStats = async (req, res, next) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);

  console.log(stats);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  console.log(stats);

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  // let arr = [];

  // monthlyApplications.forEach((item) => {
  //   let obj = {};

  //   obj.date = `${item._id.month} ${item._id.year}`;
  //   obj.count = item.count;

  //   arr.push(obj);
  // })

  // console.log(arr);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format("MMM YY");

      return { date, count };
    })
    .reverse();

  // let monthlyApplications = [
  //   {
  //     date: "May 23",
  //     count: 12,
  //   },
  //   {
  //     date: "Jun 23",
  //     count: 9,
  //   },
  //   {
  //       date: "Jul 23",
  //       count: 3,
  //     },
  // ];
  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
