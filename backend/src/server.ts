import app from './app';
import { envConfig } from './config/env.config';

const PORT = envConfig.port;

app.listen(PORT, () => {
  console.log(
    `[MXH_HSSV Backend] Running on http://localhost:${PORT} (Supabase Online: ${envConfig.supabaseUrl})`
  );
});
