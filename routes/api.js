const router=require('express').Router(),{requireAuth}=require('../middleware/auth'),{verify}=require('../middleware/csrf');
const User=require('../models/User'),Checkin=require('../models/Checkin'),Chat=require('../models/ChatMessage');
const emergency=/\b(chest pain|can't breathe|cannot breathe|difficulty breathing|severe bleeding|unconscious|passed out|stroke symptoms|face drooping|suicid(e|al)|kill myself|end my life|overdose)\b/i;
const safety="What you've described could need urgent, in-person help. Please contact your local emergency service or go to the nearest emergency department now. If you may harm yourself, move near a trusted person and seek immediate crisis support. Do not wait for an AI response. I can't assess or treat emergencies.";
router.post('/chat',requireAuth,verify,async(req,res)=>{
 const message=String(req.body.message||'').trim();
 if(!message||message.length>2000)return res.status(422).json({error:'Enter a message of up to 2,000 characters.'});
 const uid=req.session.userId;
 await Chat.create({userId:uid,role:'user',message});
 if(emergency.test(message)){await Chat.create({userId:uid,role:'assistant',message:safety,mode:'safety'});return res.json({reply:safety,mode:'safety'});}
 const baseRules='You are WellSpring AI, a supportive general wellbeing and health-education assistant, not a clinician. Do not diagnose, prescribe, recommend changing medicines, or claim certainty. Never infer a diagnosis from mood, sleep, stress or behaviour. Use plain language, concise non-judgmental suggestions. Treat any supplied personal context as incomplete user-reported information, not verified medical records. Do not repeat sensitive details unnecessarily. Ask a concise clarifying question when appropriate. For concerning symptoms advise a qualified clinician; for emergency symptoms advise local emergency services. For self-harm intent prioritize immediate human support and crisis/emergency help. Do not present recommendations as medical treatment. If user context is missing, do not imply you know their health history.';
 let context='';
 if(process.env.HEALTH_CONTEXT_ENABLED==='true'){
  const u=await User.findById(uid).lean();
  if(u?.healthContextConsent){
   const checks=await Checkin.find({userId:uid}).sort({createdAt:-1}).limit(14).lean(),p=u.healthProfile||{};
   context=' User explicitly opted in to use the following user-entered context for tailoring general wellbeing suggestions. It may be incomplete and is not a medical record. Profile: '+JSON.stringify({conditions:p.conditions,medications:p.medications,allergies:p.allergies,goals:p.goals})+'. Recent self-reported check-ins (newest first): '+JSON.stringify(checks.map(c=>({date:c.createdAt.toISOString().slice(0,10),mood:c.mood,energy:c.energy,stress:c.stress,sleepHours:c.sleepHours,activityMinutes:c.activityMinutes,note:c.note})))+'. Tailor only low-risk general wellbeing suggestions to this context; never make clinical inferences.';
  }
 }
 try{
  if(!process.env.HF_TOKEN)throw new Error('Hosted Gemma credentials are not configured');
  const prior=await Chat.find({userId:uid}).sort({createdAt:-1}).limit(9).lean();prior.reverse();
  const response=await fetch(process.env.HF_CHAT_COMPLETIONS_URL||'https://router.huggingface.co/v1/chat/completions',{
   method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.HF_TOKEN}`},
   body:JSON.stringify({model:process.env.HF_GEMMA_MODEL||'google/gemma-2-2b-it:fastest',stream:false,messages:[{role:'system',content:baseRules+context},...prior.map(x=>({role:x.role,content:x.message}))],temperature:0.3,max_tokens:650}),
   signal:AbortSignal.timeout(45000)
  });
  if(!response.ok){const detail=(await response.text()).slice(0,500);throw new Error(`Hosted Gemma request failed (${response.status}): ${detail}`);}
  const data=await response.json(),reply=data.choices?.[0]?.message?.content?.trim();
  if(!reply)throw new Error('Empty hosted model response');
  await Chat.create({userId:uid,role:'assistant',message:reply,mode:'gemma'});res.json({reply,mode:'gemma'});
 }catch(e){
  console.error('Hosted Gemma error:',e.message);
  const reply='I’m sorry, the AI service is not available right now. I can still suggest a safe next step: for a new, persistent, worsening, or worrying symptom, contact a qualified healthcare professional. I cannot diagnose or assess symptoms.';
  await Chat.create({userId:uid,role:'assistant',message:reply,mode:'fallback'});res.json({reply,mode:'fallback'});
 }
});
module.exports=router;
