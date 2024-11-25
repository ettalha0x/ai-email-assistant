# AI Email Saas

## Overview

AI email saas is an AI-powered email assistant for a company that automatically generates contextual responses to client emails based on historical interactions and client data. The system is integrated with any email provider and provide a user-friendly interface for managing email communications.

## Features

### Email Integration

- Implement Gmail API integration for reading and sending emails - Create or utilize an existing inbox interface component
- Handle email threading and conversation history
- Support basic email operations (read, send, answer)

### AI Response Generation

- Integrate with an LLM API of your choice such as OpenAI, Mistral, Gemini (free tier available), etc.
- Generate contextually relevant responses based on:
- Previous email conversations with the client
- Client data from the provided database (Clients emails in db will be changed during the test to be real emails)
- Email content and subject
- Implement response customization options:
- Direct send
- Edit before sending
- Discard and write new response