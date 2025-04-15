import { Request, Response } from "express";
import { PrismaClient, FormFieldType } from "@prisma/client";
import { createFormResponseSchema, createFormSchema } from "../zod/formSchema";
const prisma = new PrismaClient();


// Create a new form
export const createForm = async (req: Request, res: Response) => {
    try {
        const validationResult = createFormSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            return res.status(400).json({ 
                error: "Validation error", 
                details: validationResult.error.format() 
            });
        }
        
        const { name, description, fields } = validationResult.data;

        const form = await prisma.form.create({
            data: {
                name,
                description,
                fields: {
                    create: fields.map(field => ({
                        name: field.name,
                        type: field.type as FormFieldType,
                        required: field.required,
                    })),
                },
            },
            include: {
                fields: true,
            },
        });

        res.status(201).json(form);
    } catch (error) {
        console.error("Error creating form:", error);
        res.status(500).json({ error: "Failed to create form" });
    }
};

// Get all forms
export const getAllForms = async (req: Request, res: Response) => {
    try {
        const forms = await prisma.form.findMany({
            include: {
                fields: true,
            },
        });
        
        res.status(200).json(forms);
    } catch (error) {
        console.error("Error retrieving forms:", error);
        res.status(500).json({ error: "Failed to retrieve forms" });
    }
};

// Get a single form by ID
export const getFormById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const form = await prisma.form.findUnique({
            where: { id },
            include: {
                fields: true,
            },
        });
        
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }
        
        res.status(200).json(form);
    } catch (error) {
        console.error("Error retrieving form:", error);
        res.status(500).json({ error: "Failed to retrieve form" });
    }
};

// Update a form
export const updateForm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        // Check if form exists
        const existingForm = await prisma.form.findUnique({
            where: { id },
        });
        
        if (!existingForm) {
            return res.status(404).json({ error: "Form not found" });
        }
        
        const updatedForm = await prisma.form.update({
            where: { id },
            data: {
                name,
                description,
            },
            include: {
                fields: true,
            },
        });
        
        res.status(200).json(updatedForm);
    } catch (error) {
        console.error("Error updating form:", error);
        res.status(500).json({ error: "Failed to update form" });
    }
};

// Delete a form
export const deleteForm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if form exists
        const existingForm = await prisma.form.findUnique({
            where: { id },
        });
        
        if (!existingForm) {
            return res.status(404).json({ error: "Form not found" });
        }
        
        await prisma.form.delete({
            where: { id },
        });
        
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({ error: "Failed to delete form" });
    }
};

// Submit a form response
export const submitFormResponse = async (req: Request, res: Response) => {
    try {
        const validationResult = createFormResponseSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            return res.status(400).json({ 
                error: "Validation error", 
                details: validationResult.error.format() 
            });
        }
        
        const { formId, responses } = validationResult.data;
        
        // Check if form exists
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                fields: true,
            },
        });
        
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }
        
        // Validate that all required fields are present
        const requiredFields = form.fields.filter(field => field.required);
        for (const field of requiredFields) {
            if (responses[field.id] === undefined) {
                return res.status(400).json({
                    error: `Required field missing: ${field.name}`
                });
            }
        }
        
        const formResponse = await prisma.formResponse.create({
            data: {
                formId,
                responses,
            },
        });
        
        res.status(201).json(formResponse);
    } catch (error) {
        console.error("Error submitting form response:", error);
        res.status(500).json({ error: "Failed to submit form response" });
    }
    try {
        const { formId } = req.params;
        
        // Check if form exists
        const form = await prisma.form.findUnique({
            where: { id: formId },
        });
        
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }
        
        const responses = await prisma.formResponse.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' },
        });
        
        res.status(200).json(responses);
    } catch (error) {
        console.error("Error retrieving form responses:", error);
        res.status(500).json({ error: "Failed to retrieve form responses" });
    }
};