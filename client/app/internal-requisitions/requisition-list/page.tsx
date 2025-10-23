"use client";
import { useEffect, useState } from "react";
import { getInternalRequisitions } from "@/app/api";

type InternalRequisition = {
  _id: string;
  title: string;
  department: string;
  priority: string;
  neededBy: string;
  purpose: string;
};
export default function AllInternalRequisitionPage() {
  const [internalRequisitions, setInternalRequisitions] = useState<
    InternalRequisition[]
  >([]);
  useEffect(() => {
    getInternalRequisitions().then((data) => setInternalRequisitions(data));
  }, []);
  return (
    <div>
      <h1>All Internal Requisitions</h1>
      <div>
        {internalRequisitions.map((requisition) => (
          <div key={requisition._id}>{requisition.title}</div>
        ))}
      </div>
    </div>
  );
}
