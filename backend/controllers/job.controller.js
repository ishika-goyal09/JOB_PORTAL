import { Job } from "../models/job.model.js";

// Admin: Post a new job
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId,
        } = req.body;

        const userId = req.id; // Admin's user ID from middleware

        // Validate input
        if (
            !title ||
            !description ||
            !requirements ||
            !salary ||
            !location ||
            !jobType ||
            !experience ||
            !position ||
            !companyId
        ) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false,
            });
        }

        // Validate data types
        if (isNaN(Number(experience)) || isNaN(Number(position)) || isNaN(Number(salary))) {
            return res.status(400).json({
                message: "Experience, position, and salary must be valid numbers.",
                success: false,
            });
        }

        const formattedRequirements = Array.isArray(requirements)
            ? requirements
            : requirements.split(",");

        // Create a new job
        const job = await Job.create({
            title,
            description,
            requirements: formattedRequirements,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId,
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true,
        });
    } catch (error) {
        console.error("Error posting job:", {
            error: error.message,
            data: req.body,
        });
        res.status(500).json({
            message: "Internal server error while posting the job.",
            success: false,
        });
    }
};

// Student: Get all jobs with optional keyword filtering
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        };

        const jobs = await Job.find(query)
            .populate("company") // Populate company details
            .sort({ createdAt: -1 }); // Sort by latest jobs

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: keyword ? "No matching jobs found." : "No jobs found.",
                success: false,
            });
        }

        return res.status(200).json({
            jobs,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching jobs:", error.message);
        res.status(500).json({
            message: "Internal server error while fetching jobs.",
            success: false,
        });
    }
};

// Student: Get job details by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate("applications");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        return res.status(200).json({
            job,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching job by ID:", error.message);
        res.status(500).json({
            message: "Internal server error while fetching the job.",
            success: false,
        });
    }
};

// Admin: Get all jobs created by the logged-in admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({ created_by: adminId })
            .populate("company") // Populate company details
            .sort({ createdAt: -1 }); // Sort by latest jobs

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found.",
                success: false,
            });
        }

        return res.status(200).json({
            jobs,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching admin jobs:", error.message);
        res.status(500).json({
            message: "Internal server error while fetching admin jobs.",
            success: false,
        });
    }
};
