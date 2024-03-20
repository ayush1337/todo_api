import query from '../utils/query.js';

export const getAllTasks = async (req, res) => {
  try {
    const { user_id } = req;
    const user_id_buffer = Buffer.from(user_id, 'hex');

    const { status, priority, search } = req.query;

    let getTasksQuery = `
      SELECT * FROM task_lists
      WHERE user_id = ?
    `;

    const queryParams = [user_id_buffer];

    if (status) {
      const statusArray = status.split(',').map((status) => status.trim());
      const statusConditions = statusArray.map(() => 'status = ?').join(' OR ');
      getTasksQuery += ` AND (${statusConditions})`;
      queryParams.push(...statusArray);
    }

    if (priority) {
      const priorityArray = priority
        .split(',')
        .map((priority) => priority.trim());
      const priorityConditions = priorityArray
        .map(() => 'priority = ?')
        .join(' OR ');
      getTasksQuery += ` AND (${priorityConditions})`;
      queryParams.push(...priorityArray);
    }

    if (search) {
      getTasksQuery += ` AND (task_name LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    const tasks = await query(getTasksQuery, queryParams);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

export const getSingleTask = async (req, res) => {
  try {
    const taskId = req.params.taskID;

    const { user_id } = req;
    const user_id_buffer = Buffer.from(user_id, 'hex');
    const task_id_buffer = Buffer.from(taskId, 'hex');

    const getSingleTaskQuery = `
      SELECT * FROM task_lists
      WHERE task_id = ? AND user_id = ?
    `;
    const task = await query(getSingleTaskQuery, [
      task_id_buffer,
      user_id_buffer,
    ]);

    if (task.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task[0]);
  } catch (error) {
    console.error('Error fetching single task:', error);
    res.status(500).json({ error: 'Error fetching single task' });
  }
};

export const createSingleTask = async (req, res) => {
  try {
    const { task_name, description, priority, status, start_date, end_date } =
      req.body;
    const { user_id } = req;
    if (!task_name || !priority || !status || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const userIdBuffer = Buffer.from(user_id, 'hex');
    // Insert tasks
    const insertTaskQuery = `
      INSERT INTO task_lists (task_id, task_name, description, priority, status, start_date, end_date, user_id) 
      VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(insertTaskQuery, [
      task_name,
      description,
      priority,
      status,
      start_date,
      end_date,
      userIdBuffer,
    ]);

    res.status(201).json({ message: 'Task Added' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
};

export const addBulkTasks = async (req, res) => {
  try {
    const { user_id } = req;

    const tasks = req.body;

    // Validate tasks array
    if (!Array.isArray(tasks.dataArray)) {
      return res.status(400).json({ error: 'Tasks should be an array' });
    }

    // Construct values string for bulk insertion
    const values = tasks.dataArray
      .map((task) => {
        // Ensure task object has required fields
        if (!task.task_name || !task.priority) {
          throw new Error('Task object is missing required fields');
        }

        // Validate date values
        const startDate = task.start_date ? `'${task.start_date}'` : 'NULL';
        const endDate = task.end_date ? `'${task.end_date}'` : 'NULL';

        return `(
          UUID_TO_BIN(UUID()),
          '${task.task_name}',
          '${task.description || ''}',
          '${task.priority}',
          '${task.status || 'OPEN'}',
          ${startDate},
          ${endDate},
          UUID_TO_BIN('${user_id}')
        )`;
      })
      .join(',');

    const bulkInsertQuery = `
      INSERT INTO task_lists (task_id, task_name, description, priority, status, start_date, end_date, user_id)
      VALUES ${values}
    `;
    await query(bulkInsertQuery);

    res.status(201).json({ message: 'Tasks Added' });
  } catch (error) {
    console.error('Error bulk adding tasks:', error);
    res.status(500).json({ error: 'Error bulk adding tasks' });
  }
};

export const updateSingleTask = async (req, res) => {
  try {
    const taskId = req.params.taskID;
    const { user_id } = req;
    const { task_name, description, priority, status, start_date, end_date } =
      req.body;

    // Convert user_id and taskID to Buffer
    const user_id_buffer = Buffer.from(user_id, 'hex');
    const task_id_buffer = Buffer.from(taskId, 'hex');

    // Update query
    const updateTaskQuery = `
      UPDATE task_lists
      SET task_name = ?, description = ?, priority = ?, status = ?, start_date = ?, end_date = ?
      WHERE task_id = ? AND user_id = ?
    `;

    // Execute the update query
    await query(updateTaskQuery, [
      task_name,
      description,
      priority,
      status,
      start_date,
      end_date,
      task_id_buffer,
      user_id_buffer,
    ]);

    // Send success response
    res.status(200).json({ message: 'Task updated' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
};

export const deleteSingleTask = async (req, res) => {
  try {
    const taskId = req.params.taskID;
    const { user_id } = req;

    // Convert user_id and taskID to Buffer
    const user_id_buffer = Buffer.from(user_id, 'hex');
    const task_id_buffer = Buffer.from(taskId, 'hex');

    // Delete query
    const deleteTaskQuery = `
      DELETE FROM task_lists
      WHERE task_id = ? AND user_id = ?
    `;

    // Execute the delete query
    await query(deleteTaskQuery, [task_id_buffer, user_id_buffer]);

    // Send success response
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
};
