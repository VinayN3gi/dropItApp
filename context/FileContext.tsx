import React, { createContext, useContext, useState } from 'react';

type FileContextType = {
  refreshFlag: boolean;
  triggerRefresh: () => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const triggerRefresh = () => setRefreshFlag(prev => !prev);

  return (
    <FileContext.Provider value={{ refreshFlag, triggerRefresh }}>
      {children}
    </FileContext.Provider>
  );
};
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFileContext must be used within a FileProvider');
  return context;
};