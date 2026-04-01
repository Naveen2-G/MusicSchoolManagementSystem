Admin and auth-related environment variables (create a `.env` file in `backend` based on these):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/music_school

JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=7d

ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@musicschool.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@12345

FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
```


