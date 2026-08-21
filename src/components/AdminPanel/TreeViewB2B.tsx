import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Building2, 
  Users, 
  Eye, 
  Key, 
  ArrowRightLeft, 
  FolderTree,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface TreeViewB2BProps {
  accountants: any[];
  empresas: Record<string, any[]>;
  allCompanies: any[];
  colaboradoresGlobal: any[];
  counts: Record<string, number>;
  theme: any;
  isDark: boolean;
  cardStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
  handleImpersonate: (email: string) => void;
  handleResetPassword: (email: string) => Promise<void>;
  updateLimit: (userId: string, limit: number) => Promise<void>;
  reassignCompany: (companyId: string, newOwnerId: string) => Promise<void>;
}

export const TreeViewB2B: React.FC<TreeViewB2BProps> = ({
  accountants,
  empresas,
  allCompanies,
  colaboradoresGlobal,
  counts,
  theme,
  isDark,
  cardStyle,
  inputStyle,
  handleImpersonate,
  handleResetPassword,
  updateLimit,
  reassignCompany
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true // Expandir el nodo raíz por defecto
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = { root: true };
    accountants.forEach(acc => {
      next[`acc-${acc.id_usuario}`] = true;
      const accEmpresas = empresas[acc.id_usuario] || [];
      accEmpresas.forEach(emp => {
        next[`emp-${acc.id_usuario}-${emp.id}`] = true;
      });
    });
    setExpandedNodes(next);
  };

  const collapseAll = () => {
    setExpandedNodes({ root: true });
  };

  // Filtrado de contadores y empresas
  const filteredAccountants = accountants.filter(acc => {
    const matchAcc = acc.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     acc.ruc_cedula?.includes(searchTerm);

    const accEmpresas = empresas[acc.id_usuario] || [];
    const matchEmp = accEmpresas.some(emp => 
      emp.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc_empresa?.includes(searchTerm)
    );

    return matchAcc || matchEmp;
  });

  return (
    <div className="space-y-6">
      
      {/* BARRA SUPERIOR DE BÚSQUEDA Y CONTROLES DEL ÁRBOL */}
      <div style={cardStyle} className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-3 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-slate-800">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por Contador, Razón Social de Empresa o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 text-xs font-extrabold hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Maximize2 size={14} /> Expandir Todo
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 text-xs font-extrabold hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 size={14} /> Colapsar
          </button>
        </div>
      </div>

      {/* ÁRBOL JERÁRQUICO INTERACTIVO */}
      <div style={cardStyle} className="p-5 sm:p-7 space-y-4">
        
        {/* NODO RAÍZ: PROSPERA ROOT ADMIN */}
        <div className="space-y-3">
          <div 
            onClick={() => toggleNode('root')}
            className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15"
          >
            <div className="flex items-center gap-3">
              {expandedNodes['root'] ? <ChevronDown size={20} className="text-emerald-400" /> : <ChevronRight size={20} className="text-emerald-400" />}
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <FolderTree size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black m-0 flex items-center gap-2" style={{ color: theme.text }}>
                  👑 PROSPERA ROOT ADMIN
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SUPERVISOR GLOBAL
                  </span>
                </h3>
                <p className="text-[0.72rem] text-slate-400 mt-0.5 m-0">
                  {accountants.length} Contadores Registrados | {allCompanies.length} Empresas Gestionadas Totales
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                Ecosistema B2B Activo
              </span>
            </div>
          </div>

          {/* HIJOS DEL NODO RAÍZ (CONTADORES) */}
          {expandedNodes['root'] && (
            <div className="pl-4 sm:pl-8 space-y-3 border-l-2 border-slate-800 ml-4">
              {filteredAccountants.length === 0 ? (
                <div className="p-4 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-800">
                  No se encontraron contadores ni empresas con el filtro "{searchTerm}".
                </div>
              ) : (
                filteredAccountants.map((acc) => {
                  const accNodeId = `acc-${acc.id_usuario}`;
                  const isAccExpanded = expandedNodes[accNodeId] || !!searchTerm;
                  const accEmpresas = empresas[acc.id_usuario] || [];
                  const usage = counts[acc.id_usuario] || 0;
                  const limit = acc.limite_empresas || 1;

                  // Desglose de empresas Propias vs Colaboradas
                  const ownedEmpresas = accEmpresas.filter(e => e.id_usuario === acc.id_usuario);
                  const colabEmpresas = accEmpresas.filter(e => e.id_usuario !== acc.id_usuario);

                  return (
                    <div key={acc.id_usuario} className="space-y-2">
                      
                      {/* NODO NIVEL 1: CONTADOR MASTER */}
                      <div 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl transition-all border border-slate-800/80 hover:border-slate-700 gap-3"
                        style={{ background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)' }}
                      >
                        <div 
                          className="flex items-center gap-3 cursor-pointer flex-1"
                          onClick={() => toggleNode(accNodeId)}
                        >
                          {isAccExpanded ? <ChevronDown size={18} className="text-slate-400 shrink-0" /> : <ChevronRight size={18} className="text-slate-400 shrink-0" />}
                          
                          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-black text-sm shrink-0 border border-blue-500/20">
                            {acc.email?.charAt(0).toUpperCase() || '?'}
                          </div>

                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-slate-200">{acc.nombre_completo || 'Sin Nombre'}</span>
                              <span className="text-[0.68rem] text-slate-400 font-mono">({acc.email})</span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-[0.72rem] text-slate-400 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                💼 {usage}/{limit} Empresas ({ownedEmpresas.length} Propias, {colabEmpresas.length} Colaboradas)
                              </span>
                              <span>•</span>
                              <span>Login: {acc.ultimo_acceso ? new Date(acc.ultimo_acceso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}</span>
                            </div>
                          </div>
                        </div>

                        {/* ACCIONES RÁPIDAS DEL CONTADOR */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Selector de límite de empresas */}
                          <div className="flex items-center gap-1 text-xs bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
                            <span className="text-[0.68rem] text-slate-400 font-bold">Cupo:</span>
                            <input
                              type="number"
                              min={usage}
                              max={999}
                              defaultValue={limit}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                if (val !== limit && !isNaN(val)) updateLimit(acc.id_usuario, val);
                              }}
                              className="w-12 bg-transparent text-slate-200 font-black text-xs border-none text-center outline-none"
                            />
                          </div>

                          <button
                            onClick={() => handleImpersonate(acc.email)}
                            title="Impersonar este Contador"
                            className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleResetPassword(acc.email)}
                            title="Restablecer Contraseña"
                            className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-all cursor-pointer"
                          >
                            <Key size={15} />
                          </button>
                        </div>
                      </div>

                      {/* HIJOS DEL NODO CONTADOR (EMPRESAS PROPIAS Y COLABORADAS) */}
                      {isAccExpanded && (
                        <div className="pl-4 sm:pl-8 space-y-2.5 border-l-2 border-slate-800/60 ml-4 py-1">
                          {accEmpresas.length === 0 ? (
                            <div className="p-3 text-xs text-slate-500 italic">
                              Este contador no tiene empresas asignadas actualmente.
                            </div>
                          ) : (
                            accEmpresas.map((emp) => {
                              const empNodeId = `emp-${acc.id_usuario}-${emp.id}`;
                              const isEmpExpanded = expandedNodes[empNodeId] || !!searchTerm;
                              const isOwner = emp.id_usuario === acc.id_usuario;

                              // Obtener colaboradores de esta empresa
                              const companyColabs = colaboradoresGlobal.filter(c => c.id_empresa === emp.id);

                              return (
                                <div key={emp.id} className="space-y-1.5">
                                  
                                  {/* NODO NIVEL 2: EMPRESA GESTIONADA */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 gap-2">
                                    <div 
                                      className="flex items-center gap-2.5 cursor-pointer flex-1"
                                      onClick={() => toggleNode(empNodeId)}
                                    >
                                      {companyColabs.length > 0 ? (
                                        isEmpExpanded ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />
                                      ) : (
                                        <div className="w-4" />
                                      )}

                                      <Building2 size={16} className={isOwner ? 'text-emerald-400 shrink-0' : 'text-blue-400 shrink-0'} />

                                      <div className="overflow-hidden">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs text-slate-200">{emp.nombre_empresa}</span>
                                          <span className={`text-[0.65rem] font-black px-2 py-0.5 rounded-md ${
                                            isOwner ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                          }`}>
                                            {isOwner ? '👑 TITULAR' : '🤝 COLABORADOR'}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-[0.7rem] text-slate-400 mt-0.5 flex-wrap">
                                          <span>RUC: {emp.ruc_empresa || 'N/A'}</span>
                                          <span>•</span>
                                          <span>Plan: {emp.plan || 'Básico'}</span>
                                          {companyColabs.length > 0 && (
                                            <>
                                              <span>•</span>
                                              <span className="text-purple-400 font-bold">👥 {companyColabs.length} Colaboradores</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* ACCIONES RÁPIDAS DE LA EMPRESA */}
                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                      <button
                                        onClick={() => {
                                          const newOwner = prompt(`Reasignar "${emp.nombre_empresa}" a otro Contador. Ingresa el ID_USUARIO del nuevo titular:`);
                                          if (newOwner) reassignCompany(emp.id, newOwner);
                                        }}
                                        title="Reasignar Titular de esta Empresa"
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all text-[0.7rem] font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <ArrowRightLeft size={13} /> Reasignar
                                      </button>
                                    </div>
                                  </div>

                                  {/* HIJOS DEL NODO EMPRESA (COLABORADORES INVITADOS) */}
                                  {isEmpExpanded && companyColabs.length > 0 && (
                                    <div className="pl-6 space-y-1 border-l-2 border-purple-500/30 ml-4 py-1">
                                      {companyColabs.map((col) => {
                                        const colabUser = accountants.find(a => a.id_usuario === col.id_usuario);
                                        return (
                                          <div key={col.id} className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <Users size={14} className="text-purple-400" />
                                              <span className="font-bold text-slate-200">
                                                {colabUser?.nombre_completo || col.email_invitado || 'Colaborador Invitado'}
                                              </span>
                                              <span className="text-[0.65rem] text-slate-400">({col.email_invitado || colabUser?.email})</span>
                                            </div>
                                            <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                              Acceso Colaborador
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
