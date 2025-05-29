interface Config {
  port: number;
  mongoUri: string;
  apiUrl: string;
  apiToken: string;
  nodeEnv: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/telesite',
  apiUrl: process.env.API_URL || 'https://strattera.tgapp.online/api/v1',
  apiToken: process.env.API_TOKEN || '8cM9wVBrY3p56k4L1VBpIBwOsw',
  nodeEnv: process.env.NODE_ENV || 'development'
};

export default config; 