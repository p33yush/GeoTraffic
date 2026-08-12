require('dotenv').config();
const { Kafka } = require('kafkajs');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const kafka = new Kafka({
    clientId: 'ai-worker',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'ai-processor-group' });

async function startWorker() {
    await consumer.connect();
    console.log('ai worker connected');

    await consumer.subscribe({ topic: 'traffic-events', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());

            console.log(`\n evaluating ${event.type} at ${event.eventId}...`);

            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: " you are a traffic analysis AI. Respond with ONLY a single number from 1 to 10 indicating the severity of the event."
                        },
                        {
                            role: "user",
                            content: `a traffic event occurred of type: ${event.type}. what's the severity?`
                        }
                    ],
                    model: "llama-3.1-8b-instant",
                });

                const severityScore = chatCompletion.choices[0]?.message?.content;
                console.log(`ai severity score for ${event.type} : ${severityScore}/10`);
            } catch (error) {
                console.error("ai error:", error.message);
            }
        },
    });
}

startWorker().catch(console.error);



