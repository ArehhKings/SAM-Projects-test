import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);
let response;

export async function CreateUser(event, context) {
  const { firstName, lastName, city, state, phone, address, email } =
    JSON.parse(event.body);
  try {
    const data = await ddbDocClient.put({
      TableName: "adzoneuserDB",
      Item: {
        id: uuidv4(),
        firstName,
        lastName,
        phone,
        city,
        state,
        email,
        address,
      },
    });

    response = {
      statusCode: 201,
      body: JSON.stringify({
        statusCode: 201,
        message: "User is created successfully",
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}

export async function GetUser(event, context) {
  const userId = event.pathParameters.id;

  try {
    const data = await ddbDocClient.get({
      TableName: "adzoneuserDB",
      Key: {
        id: userId,
      },
    });

    if (!data.Item) {
      // If the user with the specified ID is not found
      response = {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    } else {
      // If the user is found
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "User found",
          user: data.Item,
        }),
      };
    }
  } catch (error) {
    console.log(error);
    // Handle other errors if necessary
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }

  return response;
}

export async function UpdateUser(event, context) {
  const Item = JSON.parse(event.body);
  try {
    const data = await ddbDocClient.update({
      TableName: "adzoneuserDB",
      Key: {
        id: event.pathParameters.id,
      },
      UpdateExpression:
        "set firstName= :fn, lastName=:ln, phone=:no, city=:cy, state=:st, address= ad",
      ExpressionAttributeValues: {
        ":fn": Item.firstName,
        ":ln": Item.lastName,
        ":no": Item.phone,
        ":cy": Item.city,
        ":st": Item.state,
        ":ad": Item.address,
      },
      ReturnValues: "UPDATED_NEW",
    });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "User is successfully updated",
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}
