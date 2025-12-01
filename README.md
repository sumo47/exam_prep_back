# Backend Setup Instructions

## 1. Add Your MongoDB Connection String

Open `server/.env` and replace `YOUR_MONGODB_CONNECTION_STRING` with your actual MongoDB connection string.

Your `.env` file should look like this:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/examprep?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_here
GOOGLE_CLIENT_ID=548656262718-did7qitoikdd973epa9p7nuttc1gu0lv.apps.googleusercontent.com
PORT=5000
FRONTEND_URL=http://localhost:5174
```

## 2. Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace `your_random_secret_here` in the `.env` file.

## 3. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

## 4. Verify Server is Running

Open your browser and go to: `http://localhost:5000/api/health`

You should see: `{"status":"Server is running"}`

## Next Steps

After the backend is running, I'll update the frontend to connect to the API instead of using localStorage.
