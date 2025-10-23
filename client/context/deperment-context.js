"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const DEPARTMENT_TOKEN_KEY = "department";

export const DepartmentContext = createContext({
  department: null,
  setDepartment: () => {},
});

export const DepartmentProvider = ({ children }) => {
  const [department, setDepartmentState] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(DEPARTMENT_TOKEN_KEY);
      try {
        if (token) {
          const decoded = jwtDecode(token);
          setDepartmentState(decoded.department);
        }
      } catch (error) {
        console.error("Error decoding department token:", error);
        localStorage.removeItem(DEPARTMENT_TOKEN_KEY);
      }
    }
  }, []);

  const setDepartment = (newDepartment) => {
    setDepartmentState(newDepartment);

    if (typeof window !== "undefined") {
      if (newDepartment) {
        // We can just base64 encode it — no secret key needed client-side
        const token = btoa(JSON.stringify({ department: newDepartment }));
        localStorage.setItem(DEPARTMENT_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(DEPARTMENT_TOKEN_KEY);
      }
    }
  };

  return (
    <DepartmentContext.Provider value={{ department, setDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => useContext(DepartmentContext);
