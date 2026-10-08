import React from 'react';
import { ArrowRight, GraduationCap, Building2, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mx-auto">
          <GraduationCap className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to <span className="text-blue-600">SkoollHub</span>
          </h1>
          <p className="text-sm text-slate-500">
            The all-in-one platform for Nigerian university students.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-xs font-semibold text-slate-800">Housing</p>
            <p className="text-[10px] text-slate-500">Find lodges near campus</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-100">
            <Users className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-xs font-semibold text-slate-800">Roommates</p>
            <p className="text-[10px] text-slate-500">Match with students</p>
          </div>
        </div>

        <button 
          type="button" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}