import type { Response, Request } from "express";
import Task from "../models/Task";


export class TaskController {

    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body);
            task.project = req.project.id;
            req.project.tasks.push(task.id);
            await Promise.allSettled([task.save(), req.project.save()]);
            res.send('Tarea creada correctamente')

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project');

            res.json(tasks);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                .populate([
                    {
                        path: 'completedBy.user',
                        select: 'id name email'
                    },
                    {
                        path: 'notes',
                        populate: {
                            path: 'createdBy',
                            model: 'User',
                            select: 'id name email'
                        }
                    }
                ]);

            console.log(task)
            res.json(task);

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {

            req.task.name = req.body.name;
            req.task.description = req.body.description;
            req.task.save();

            res.send('Tarea Actualizada Correctamente');

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(item => item.toString() !== req.task.id.toString());
            await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
            res.send('Tarea Eliminada Correctamente');

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateStatus = async (req: Request, res: Response) => {

        try {
            const { status } = req.body;
            req.task.status = status;

            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data);

            await req.task.save();
            res.send('Tarea Actualizada');

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}
