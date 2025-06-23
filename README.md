# users-management

How to run:

1. Install MySQL server
   ###### brew install mysql
2. Create database with name `testdb`
3. Set credentials in file ``.env`` and `lib/mysql.ts`(by default user - `root` with empty password)
4. Run in terminal:

   ###### npm install prisma @prisma/client mysql2 xlsx
   ###### npx prisma migrate dev --name init
   ###### npm run dev