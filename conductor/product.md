# Initial Concept
Automated essay grading system for teachers and students using Gemini embeddings and LSA.

# Product Guide

## Mission
SCOVA is an intelligent, full-stack web application designed to assist in essay grading through a "CoGrader" workflow. By leveraging advanced Google Gemini text embeddings and a supplementary LSA engine, the platform generates draft feedback and score suggestions that teachers can review, modify, and finalize before they are shared with students.

## Target Audience
- **Teachers:** Empowered with tools to quickly create classes, manage assignments, and act as the final authority in the grading process by reviewing and overriding AI-generated suggestions.
- **Students:** Provided with a seamless experience to submit assignments in various formats (PDF, DOCX, TXT) and view their results clearly once published by their teacher.

## Core Focus (Current Phase)
The primary objective of the current development phase is **Feature Expansion**, focusing on introducing new capabilities to augment the grading process, such as plagiarism detection, to provide a richer experience beyond basic scoring. Automated detailed pedagogical feedback generation is now a core feature of the platform.

## Grading Architecture Strategy
While the Google Gemini embedding model drives the primary grading engine via semantic similarity, the legacy TF-IDF + Latent Semantic Analysis (LSA) engine with Sastrawi support is being actively maintained and improved. The long-term vision is to elevate the LSA engine's accuracy so it can serve as a robust, viable alternative for specific grading scenarios or resource-constrained environments.

## Value Proposition
- **Efficiency:** Drastically cuts down the time teachers spend grading essays.
- **Flexibility:** Supports multiple file formats and Indonesian language nuances.
- **Scalability:** Built on a containerized, decoupled architecture (Next.js & Flask) with a reliable Supabase backend.
