import React from "react";
type Field =
 | { id:string; type:'select'; label:string; options:string[]; required?:boolean }
 | { id:string; type:'radio';  label:string; options:string[]; required?:boolean }
 | { id:string; type:'yesno';  label:string; required?:boolean }
 | { id:string; type:'checkbox'; label:string; options:string[]; required?:boolean };

type Props = { schema: Field[]; value: Record<string,any>; onChange:(v:Record<string,any>)=>void };

export default function DynamicForm({ schema, value, onChange }: Props){
  function setVal(id:string, v:any){ onChange({ ...value, [id]: v }); }

  function toggleCheckboxValue(id: string, option: string) {
    const current = value[id] || [];
    const newValue = current.includes(option) 
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    setVal(id, newValue);
  }

  return (
    <div className="space-y-4">
      {schema.map(f => (
        <div key={f.id} className="space-y-1">
          <label className="block text-sm font-medium">{f.label}{(f as any).required && ' *'}</label>

          {f.type==='select' && (
            <select className="w-full border rounded-lg h-12 px-3"
              value={value[f.id] ?? ''} onChange={e=>setVal(f.id, e.target.value)}>
              <option value="" disabled>Select…</option>
              {f.options.map(o=> <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {f.type==='radio' && (
            <div className="flex gap-3 flex-wrap">
              {f.options.map(o=>(
                <label key={o} className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name={f.id} checked={value[f.id]===o}
                    onChange={()=>setVal(f.id,o)} /> 
                  <span>{o}</span>
                </label>
              ))}
            </div>
          )}

          {f.type==='yesno' && (
            <div className="flex gap-3">
              <button type="button" onClick={()=>setVal(f.id,true)}
                className={`px-4 h-10 rounded-lg border ${value[f.id]===true?'bg-black text-white':''}`}>
                Yes
              </button>
              <button type="button" onClick={()=>setVal(f.id,false)}
                className={`px-4 h-10 rounded-lg border ${value[f.id]===false?'bg-black text-white':''}`}>
                No
              </button>
            </div>
          )}

          {f.type==='checkbox' && (
            <div className="space-y-2">
              {f.options.map(o=>(
                <label key={o} className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(value[f.id] || []).includes(o)}
                    onChange={()=>toggleCheckboxValue(f.id, o)} 
                  />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}