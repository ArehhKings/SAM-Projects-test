import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);
let response;

export async function FetchAllUsers(event, context) {
  try {
    const data = await ddbDocClient.scan({
      TableName: "usersDB",
    });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        users: data.Items,
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}

export async function CreateUser(event, context) {
  const { firstName, lastName, phone, city, state, address, email } =
    JSON.parse(event.body);
  try {
    const data = await ddbDocClient.put({
      TableName: "adzone-userDB",
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
        message: "User has been created successfully",
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}

export async function GetUser(event, context) {
  const Id = event.pathParameters.id;

  try {
    const data = await ddbDocClient.get({
      TableName: "adzone-userDB",
      Key: {
        id: Id,
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
      TableName: "adzone-userDB",
      Key: {
        id: event.pathParameter.id,
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
        message: "User has been Updated Successfully",
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}

export async function DeleteUser(event, context) {
  const id = event.pathParameters.id;
  try {
    const data = await ddbDocClient.delete({
      TableName: "usersDB",
      Key: {
        id: id,
      },
    });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "User has besn successfully deleted",
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}
