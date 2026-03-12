export const reqInfo = (req: any) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    if (process.env.NODE_ENV === 'development') {
      if (req.body && Object.keys(req.body).length) {
        console.log('Body:', req.body);
      }
      if (req.params && Object.keys(req.params).length) {
        console.log('Params:', req.params);
      }
      if (req.query && Object.keys(req.query).length) {
        console.log('Query:', req.query);
      }
    }
  };