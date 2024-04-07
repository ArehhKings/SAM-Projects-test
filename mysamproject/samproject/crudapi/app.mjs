import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

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
  const { firstName, lastName, phoneNo, address, email } = JSON.parse(
    event.body
  );
  try {
    const data = await ddbDocClient.put({
      TableName: "usersDB",
      Item: {
        id: uuidv4(),
        firstName,
        lastName,
        email,
        phoneNo,
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

export async function DeleteUser(event, context) {
  try {
    const data = await ddbDocClient.delete({
      TableName: "usersDB",
      Key: {
        id: event.pathParameters.id,
      },
    });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "User is successfully deleted",
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return response;
}

export async function UpdateUser(event, context) {
  const Item = JSON.parse(event.body);
  try {
    const data = await ddbDocClient.update({
      TableName: "usersDB",
      Key: {
        id: event.pathParameters.id,
      },
      UpdateExpression:
        "set firstName= :u, lastName=:l, phoneNo=:n, email= :e, address= :p",
      ExpressionAttributeValues: {
        ":u": Item.firstName,
        ":l": Item.lastName,
        ":e": Item.email,
        ":p": Item.address,
        ":n": Item.phoneNo,
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
