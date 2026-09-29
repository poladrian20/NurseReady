export type ReviewSection={key:string;title:string;text:string};
// Every character belongs to exactly one section. No generated clinical content.
export function splitNote(text:string):ReviewSection[]{
 if(!text.trim())return [];
 const lines=text.match(/[^\n]*\n|[^\n]+$/g)||[];const chunks:string[]=[];let current='';
 for(const line of lines){const clean=line.trim();const heading=/^(#{1,4}\s|--- Page \d|\d+[.)]\s.{3,70}$)/.test(clean)||(/^[A-Z][A-Z /&(),-]{3,75}:?$/.test(clean))||(/^[^.!?]{3,75}:$/.test(clean));
 if(current&&(heading||(current.length>=1800&&!clean))){chunks.push(current);current='';}current+=line;}
 if(current)chunks.push(current);
 return chunks.map((text,i)=>{let hash=2166136261;for(let j=0;j<text.length;j++){hash^=text.charCodeAt(j);hash=Math.imul(hash,16777619);}const first=text.trim().split('\n')[0].replace(/^#{1,4}\s*/, '');return {key:`${i}-${hash>>>0}`,title:first.length>85?`Part ${i+1} · ${first.slice(0,65)}…`:first,text};});
}
