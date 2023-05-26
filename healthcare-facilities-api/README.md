# Heath Care Facilities API

The Heath Care Facilities API is a RESTful API that provides functionality for managing shifts in healthcare facilities. It allows users to find available shifts, claim shifts, and perform other related operations.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Performance Concerns](#performance)

## Getting Started

These instructions will guide you on how to set up the Heath Care Facilities API on your local machine for development and testing purposes.

### Prerequisites

Before getting started, make sure you have the following software installed:

- Node.js 18
- Yarn 1.22
- Docker


> This project has `.nvmrc`, `.node-version`, and `.tool-versions` files compatible with version managers.

### Installation

Follow the steps below to install and set up the API:

1. Clone the repository:

    ```bash
      git clone https://github.com/Clipboard-recruiting/candidate-sse-take-home-challenge-327.git
    ```

2. Follow the seeding instructions from [README.md](https://github.com/Clipboard-recruiting/candidate-sse-take-home-challenge-327)

3. Change into the project directory:

    ```bash
    cd candidate-sse-take-home-challenge-327/healthcare-facilities-api
    ```

4. Install the dependencies using Yarn:

    ```bash
    yarn install
    ```

5. Generate the Prisma client:

    ```bash
    yarn prisma generate
    ```

This will generate the Prisma client based on the database schema.

6. Start the API:

    ```bash
    yarn start
    ```

The API will start listening on the configured port (default: 3000).


## Usage

To use the Heath Care Facilities API, you can make HTTP requests to the available endpoints using your preferred API client. Below are some examples of how to interact with the API:

### Find Available Shifts

To find available shifts within a specified date range, send a GET request to the following endpoint:

```
 GET /shifts/available?facilityId=<facilityId>&workerId=<workerId>&startDate=<startDate>&endDate=<endDate>&page=<page>&pageSize=<pageSize>
 ```

Replace the placeholders with the actual values:

- `facilityId`: ID of the facility to search for shifts.
- `workerId`: ID of the worker to filter shifts.
- `startDate`: Start date of the date range.
- `endDate`: End date of the date range.
- `page`: (Optional) Page number for pagination.
- `pageSize`: (Optional) Number of shifts per page.

The API will return a list of available shifts based on the provided parameters.

### Claim Shift

To claim a shift, send a POST request to the following endpoint:


## API Documentation

- You can find the API docs accessing [http://localhost:3000/api](http://localhost:3000/api#/Shifts/ShiftController_findAllAvailable)
- 

## Contributing

Thank you for considering contributing to the Heath Care Facilities API! Contributions are welcome and encouraged. To contribute to the project, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make the necessary code changes and additions.
4. Write tests to ensure the changes are covered (if applicable).
5. Run the existing tests to ensure they pass.
6. Commit your changes and push them to your forked repository.
7. Submit a pull request to the main repository.

Please provide a clear and detailed description of your changes in the pull request. It is also helpful to include any relevant information or context about the issue or feature you are addressing.

### Development Guidelines

To maintain code consistency and adhere to best practices, please consider the following guidelines when contributing:

- Follow the existing code style and formatting.
- Write clear and concise commit messages.
- Include tests for new features or bug fixes.
- Document any changes or additions to the API.
- We tried to follow SOLID and DDD standards as much as possible.
- We follow the REST API standards.


## Performance Concerns

To ensure optimal performance for the endpoint, we've opted to utilize Prisma. This tool offers us superior performance and execution plan management, thereby enabling us to craft the most efficient queries possible.

We've undertaken a strategic division of filters to mitigate the computational costs of the queries and limit the necessity for multiple joins.

Furthermore, we've implemented early-stage validations to promptly identify and handle invalid inputs, enhancing our overall efficiency.

By prioritizing interaction with smaller tables before addressing the larger ones, we're able to limit data access to the absolute necessary minimum. This method further contributes to maintaining a high level of performance.

Looking forward to witnessing the impact of these enhancements on our overall system efficiency.

## New Relic

- (WIP) Performance analysis reports. 
