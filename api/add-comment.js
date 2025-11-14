import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const commentsCollection = client.db("bookHavenDB").collection("comments");

  const comment = req.body;
  comment.createdAt = new Date();

  const result = await commentsCollection.insertOne(comment);
  res.json({ _id: result.insertedId, ...comment });
}
