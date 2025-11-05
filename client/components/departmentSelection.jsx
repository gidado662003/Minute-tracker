import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { handleDepartment } from "@/app/api";
import { motion, AnimatePresence } from "framer-motion";

function DepartmentSelection() {
  const [departments, setDepartments] = useState([
    "HR",
    "Engineering",
    "Marketing",
    "Sales",
    "Support",
    "IT",
    "Delivery",
    "Finance",
    "MD",
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDepartmentIcon = (dept) => {
    const icons = {
      HR: "👥",
      Engineering: "⚙️",
      Marketing: "📢",
      Sales: "📈",
      Support: "🤝",
      IT: "💻",
      Delivery: "🚚",
      Finance: "💰",
      MD: "💼",
    };
    return icons[dept] || "🏢";
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      HR: "bg-purple-500 hover:bg-purple-600 border-purple-500",
      Finance: "bg-green-500 hover:bg-green-600 border-green-500",
      Engineering: "bg-blue-500 hover:bg-blue-600 border-blue-500",
      Marketing: "bg-pink-500 hover:bg-pink-600 border-pink-500",
      Sales: "bg-orange-500 hover:bg-orange-600 border-orange-500",
      Support: "bg-teal-500 hover:bg-teal-600 border-teal-500",
      IT: "bg-indigo-500 hover:bg-indigo-600 border-indigo-500",
      Delivery: "bg-amber-500 hover:bg-amber-600 border-amber-500",
    };
    return colors[dept] || "bg-gray-500 hover:bg-gray-600 border-gray-500";
  };

  const getDepartment = async (department) => {
    setIsLoading(true);
    setSelectedDepartment(department);

    try {
      const response = await handleDepartment(department.toLowerCase());
      // Store the single auth token for all requests
      localStorage.setItem("authToken", response.token);

      // Drop department cookie usage; rely solely on Authorization header

      // Reload so API calls pick up the token
      window.location.reload();
    } catch (error) {
      console.error("Error selecting department:", error);
      setSelectedDepartment(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const loadingVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
      },
    },
    exit: { scale: 0.8, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl"
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  delay: 0.3,
                }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-2xl">🏢</span>
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                Welcome to Your Workspace
              </CardTitle>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-100 mt-2"
              >
                Select your department to get started
              </motion.p>
            </CardHeader>
          </motion.div>

          <CardContent className="px-8 pb-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {departments.map((dept) => (
                <motion.div
                  key={dept}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 400 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => getDepartment(dept)}
                    disabled={isLoading}
                    className={`
                      w-full h-28 flex flex-col items-center justify-center p-4 relative
                      transition-all cursor-pointer duration-300 hover:shadow-lg
                      ${
                        selectedDepartment === dept
                          ? `${getDepartmentColor(dept)} text-white shadow-lg`
                          : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                      }
                      ${
                        isLoading && selectedDepartment !== dept
                          ? "opacity-50"
                          : ""
                      }
                    `}
                  >
                    <motion.span
                      className="text-3xl mb-2"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {getDepartmentIcon(dept)}
                    </motion.span>
                    <span className="text-sm font-semibold cursor-pointer text-center leading-tight">
                      {dept}
                    </span>

                    <AnimatePresence>
                      {selectedDepartment === dept && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          className="absolute  top-2 right-2"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                delay: 0.2,
                              }}
                              className="w-5 h-5 bg-white text-green-600 rounded-full flex items-center justify-center text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  variants={loadingVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-6 text-center"
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full"
                    />
                    Setting up your workspace...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default DepartmentSelection;
