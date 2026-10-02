/**
 * Task Management Controller
 */

const Task = require('../models/Task.model');

let taskCounter = 10001;
function generateTaskId() {
  taskCounter += 1;
  return `TSK-2027-${String(taskCounter).padStart(6, '0')}`;
}

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedVolunteer, zoneId, locationText, priority, source } = req.body;
    const taskId = generateTaskId();

    const task = await Task.create({
      taskId,
      title,
      description,
      source: source || 'SUPERVISOR',
      priority: priority || 'P2',
      assignedVolunteer,
      zoneId,
      locationText,
      status: 'ASSIGNED',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('task-assigned', task);
    }

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get tasks for volunteer or supervisor
exports.getTasks = async (req, res) => {
  try {
    const { volunteerId } = req.query;
    const query = volunteerId ? { assignedVolunteer: volunteerId } : {};
    let tasks = await Task.find(query).sort({ createdAt: -1 });

    if (tasks.length === 0) {
      // Seed default volunteer tasks if empty
      tasks = [
        {
          _id: 'task_001',
          taskId: 'TASK_101',
          title: 'Assist Medical Camp B',
          description: 'Deploy to Ram Ghat Medical Station B for crowd queue management.',
          priority: 'P1',
          source: 'SUPERVISOR',
          status: 'ASSIGNED',
          locationText: 'Ram Ghat Sector B',
          createdAt: new Date(),
        },
        {
          _id: 'task_002',
          taskId: 'TASK_102',
          title: 'Lost Child Search Assist',
          description: 'Help locate 7-year-old child wearing red shirt near Kalaram temple gate 2.',
          priority: 'P0',
          source: 'INCIDENT',
          status: 'IN_PROGRESS',
          locationText: 'Kalaram Temple Gate 2',
          createdAt: new Date(),
        },
      ];
    }

    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update task status (ACCEPTED, IN_PROGRESS, COMPLETED, VERIFIED, REJECTED)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, verificationNotes } = req.body;

    const task = await Task.findOne({ $or: [{ taskId }, { _id: taskId }] });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = status;
    if (status === 'IN_PROGRESS') task.startedAt = new Date();
    if (status === 'COMPLETED') task.completedAt = new Date();
    if (status === 'VERIFIED') task.verificationNotes = verificationNotes || 'Verified by supervisor.';

    await task.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('task-updated', task);
    }

    return res.json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
