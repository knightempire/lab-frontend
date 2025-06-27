# Use an official Node.js runtime as the base image
FROM node:22.14.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js will run on (default is 3000)
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
