import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import dayjs from "dayjs";
// import { nanoid } from "nanoid";
// import { NotFoundError } from "../errors/customErrors.js";

// let jobs = [
//     {id : nanoid(),company : 'apple',position:'front-end'},
//     {id : nanoid(),company : 'google',position:'back-end'},
// ]

export const getAllJobs = async (req, res) => {
  // console.log(jobss);
  console.log(req.user);
  const jobs = await Job.find({ createdBy: req.user.userId });
  res.status(StatusCodes.OK).json({ jobs });
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
  const defaultStats = {
    pending: 22,
    interview: 11,
    declined: 4,
  };

  let monthlyApplications = [
    {
      date: "May 23",
      count: 12,
    },
    {
      date: "Jun 23",
      count: 9,
    },
    {
        date: "Jul 23",
        count: 3,
      },
  ];
  res.status(StatusCodes.OK).json({defaultStats,monthlyApplications});
};
