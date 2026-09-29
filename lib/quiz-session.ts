type Item={id:string;topic:string};
export function buildQuizSession<T extends Item>(bank:T[],topic:string,count:number,fill:boolean,random:()=>number=Math.random):T[]{
 const unique=[...new Map(bank.map(q=>[q.id,q])).values()];
 function shuffle(list:T[]){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 const focused=topic==='all'?unique:unique.filter(q=>q.topic===topic);
 const rest=fill&&topic!=='all'?shuffle(unique.filter(q=>q.topic!==topic)):[];
 return [...shuffle(focused),...rest].slice(0,Math.max(0,count));
}
