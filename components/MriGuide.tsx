"use client";

import { GuideChevronIcon, ListInfoIcon } from "@/components/Icons";
import { MRI_GUIDE_FOOT, MRI_GUIDE_ITEMS, MRI_GUIDE_PREP_FOOT, MRI_GUIDE_PREP_LEAD, MRI_GUIDE_TITLE } from "@/lib/constants";
import { useState } from "react";

export function MriGuide() {
  const [open, setOpen] = useState(true);

  return (
    <section className={`mri-guide${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="mri-guide-toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <ListInfoIcon />
        <strong>{MRI_GUIDE_TITLE}</strong>
        <GuideChevronIcon open={open} />
      </button>
      {open ? (
        <div className="mri-guide-body">
          <p className="mri-guide-prep">
            <strong>{MRI_GUIDE_PREP_LEAD}</strong>
            {MRI_GUIDE_PREP_FOOT}
          </p>
          {MRI_GUIDE_ITEMS.map((item) => (
            <p key={item.title}>
              <strong>{item.title}</strong>
              {item.body}
            </p>
          ))}
          <p>{MRI_GUIDE_FOOT}</p>
        </div>
      ) : null}
    </section>
  );
}
