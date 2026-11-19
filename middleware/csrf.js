const crypto=require('crypto');
exports.token=(req,res,next)=>{if(!req.session.csrf)req.session.csrf=crypto.randomBytes(32).toString('hex');res.locals.csrfToken=req.session.csrf;next();};
exports.verify=(req,res,next)=>{const sent=req.body._csrf||req.get('x-csrf-token')||'';if(typeof sent!=='string'||!req.session.csrf||sent.length!==req.session.csrf.length||!crypto.timingSafeEqual(Buffer.from(sent),Buffer.from(req.session.csrf)))return res.status(419).send('Session expired. Refresh and try again.');next();};
