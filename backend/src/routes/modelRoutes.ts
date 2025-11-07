import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { AIModel } from '../models/AIModel';

const router = Router();

// Get all models
router.get('/', async (req, res) => {
  try {
    const modelRepository = AppDataSource.getRepository(AIModel);
    const models = await modelRepository.find({
      order: { id: 'ASC' },
    });

    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch models' });
  }
});

// Get model by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const modelRepository = AppDataSource.getRepository(AIModel);
    const model = await modelRepository.findOne({
      where: { id: Number(id) },
      relations: ['trades', 'positions'],
    });

    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    res.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch model' });
  }
});

// Create new model
router.post('/', async (req, res) => {
  try {
    const modelRepository = AppDataSource.getRepository(AIModel);
    const newModel = modelRepository.create(req.body);
    const savedModel = await modelRepository.save(newModel);

    res.status(201).json(savedModel);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ success: false, message: 'Failed to create model' });
  }
});

// Update model
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const modelRepository = AppDataSource.getRepository(AIModel);

    const model = await modelRepository.findOne({ where: { id: Number(id) } });
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    modelRepository.merge(model, req.body);
    const updatedModel = await modelRepository.save(model);

    res.json(updatedModel);
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({ success: false, message: 'Failed to update model' });
  }
});

// Delete model
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const modelRepository = AppDataSource.getRepository(AIModel);

    const model = await modelRepository.findOne({ where: { id: Number(id) } });
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    await modelRepository.remove(model);
    res.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ success: false, message: 'Failed to delete model' });
  }
});

export default router;
