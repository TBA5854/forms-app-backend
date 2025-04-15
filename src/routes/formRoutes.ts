import express from 'express';
import {

    createForm,
    deleteForm,
    getAllForms,
    getFormById,
    submitFormResponse,
    updateForm,
} from '../controllers/formController';
const router = express.Router();

// Form CRUD routes
router.post('/forms', createForm);
router.get('/forms', getAllForms);
router.get('/forms/:id', getFormById);
router.put('/forms/:id', updateForm);
router.delete('/forms/:id', deleteForm);

// Form response routes
router.post('/forms/:formId/responses', submitFormResponse);
//TODO router.get('/forms/:formId/responses', function to get all responses for a form and per user);

export default router;