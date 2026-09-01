export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Invalid request.";
      return res.status(400).json({ error: message });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Invalid request.";
      return res.status(400).json({ error: message });
    }
    req.query = result.data;
    next();
  };
}
