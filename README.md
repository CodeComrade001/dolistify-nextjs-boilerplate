# Dolistify

Dolistify is a web application built with Next.js and Supabase. It allows users to manage tasks, likely including features such as adding new tasks, viewing them on a dashboard, and updating existing tasks. It also includes user authentication.

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:
*   Node.js (which includes npm)

### Setup

Follow these steps to set up and run the Dolistify project locally.

#### 1. Clone the Repository

Open your terminal and clone the repository using the following command. Replace `<repository-url>` with the actual URL of the repository.

```bash
git clone <repository-url>
```

#### 2. Navigate into the Project Directory

Change your current directory to the newly cloned project folder:

```bash
cd dolistify
```

#### 3. Install Dependencies

Install the necessary project dependencies using npm (Node Package Manager).

```bash
npm install
```

#### 4. Environment Variable Setup

This project requires environment variables to connect to Supabase and for other configurations. These variables are stored in a `.env.local` file at the root of the project.

*   Create a new file named `.env.local` in the root of the `dolistify` project directory.
*   Copy the following template into your `.env.local` file:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

*   **How to get Supabase credentials:**
    *   Go to your Supabase project dashboard.
    *   Navigate to `Project Settings`.
    *   Under `API`, you will find your `Project URL` (this is your `NEXT_PUBLIC_SUPABASE_URL`) and the `anon` `public` key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    *   Copy these values and paste them into your `.env.local` file, replacing the placeholder text.

    **Note:** Keep your `.env.local` file private and do not commit it to version control. The `.gitignore` file should already be configured to ignore it.

## Running the Application

Once you have installed the dependencies and configured your environment variables, you can start the Next.js development server:

```bash
npm run dev
```

This command will typically start the application on `http://localhost:3000`. Open this URL in your web browser to see the application running.
Any changes you make to the code will automatically reload the application in your browser.

## Technologies Used

*   Next.js
*   React
*   Supabase
*   TypeScript
*   Tailwind CSS (Assumed, to be confirmed)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
