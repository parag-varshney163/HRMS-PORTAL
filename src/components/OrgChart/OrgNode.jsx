import { Crown, UserRound, Shield, Code, Palette, Headphones, } from "lucide-react";
// import { Crown, UserRound, Shield, Code, Palette, Headphones, } from "lucide-react";
// import React from "react";
// import colors from "../../constants/colors";
// const getIcon = (role) => {
//   const r = role?.toLowerCase() || "";
//   if (r.includes("director"))
//     return <Crown size={20} color="#fff" />;
//   if (r.includes("manager"))
//     return <UserRound size={20} color="#fff" />;
//   if (r.includes("developer"))
//     return <Code size={20} color="#fff" />;
//   if (r.includes("designer"))
//     return <Palette size={20} color="#fff" />;
//   if (r.includes("operations"))
//     return <Headphones size={20} color="#fff" />;
//   return <Shield size={20} color="#fff" />;
// };
// const getCardColor = (dept) => {
//   const name = dept?.toLowerCase() || "";
//   if (name.includes("tech"))
//     return "#4169b1";
//   if (name.includes("design"))
//     return "#5B50C8";
//   if (name.includes("trust"))
//     return "#A53F36";
//   if (name.includes("creator"))
//     return "#3D7B65";
//   if (name.includes("human"))
//     return "#8A5A20";
//   return "#444";
// };
// export default function OrgNode({ node }) {
//   if (!node) return null;
//   const bg = getCardColor(node.department?.name);
//   return (
//     <div className="flex flex-col items-center">
//       <div
//         className="rounded-2xl px-6 py-5 min-w-[50px] text-center shadow-lg"
//         style={{ background: bg }}
//       >
//         <div className="flex justify-center mb-2">
//           {getIcon(node.roleTitle)}
//         </div>
//         <h3 className="text-white font-bold text-xl">
//           {node.user
//             ? `${node.user.firstName} ${node.user.lastName}`
//             : "Vacant"}
//         </h3>
//         <p className="text-white/80 text-lg">
//           {node.roleTitle}
//         </p>
//       </div>
//       {node.reports?.length > 0 && (
//         <>
//           <div
//             className="w-[2px] h-10"
//             style={{ background: colors.cardBorder }}
//           />
//           <div className="relative flex justify-center gap-5 mt-3">
//             <div
//               className="absolute top-0 left-0 right-0 h-[2px]"
//               style={{ background: colors.cardBorder }}
//             />
//             {node.reports.map((child) => (
//               <div
//                 key={child._id}
//                 className="relative flex flex-col items-center pt-6"
//               >
//                 <div
//                   className="absolute top-0 w-[2px] h-6"
//                   style={{ background: colors.cardBorder }}
//                 />
//                 <OrgNode node={child} />
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
import React from "react";

import colors from "../../constants/colors";


const getIcon = (role) => {
  const r = role?.toLowerCase() || "";

  if (r.includes("director"))
    return <Crown size={18} color="#fff" />;

  if (r.includes("manager"))
    return <UserRound size={18} color="#fff" />;

  if (r.includes("developer"))
    return <Code size={18} color="#fff" />;

  if (r.includes("designer"))
    return <Palette size={18} color="#fff" />;

  if (r.includes("operations"))
    return <Headphones size={18} color="#fff" />;

  return <Shield size={18} color="#fff" />;
};

const getCardColor = (dept) => {
  const name = dept?.toLowerCase() || "";

  if (name.includes("tech")) return "#4169B1";

  if (name.includes("design")) return "#5B50C8";

  if (name.includes("trust")) return "#A53F36";

  if (name.includes("creator")) return "#3D7B65";

  if (name.includes("human")) return "#8A5A20";

  return "#444";
};

export default function OrgNode({ node }) {
  if (!node) return null;

  const bg = getCardColor(node.department?.name);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Card */}
      <div
        className="rounded-2xl px-4 py-4 w-[180px] shadow-md"
        style={{
          background: bg,
        }}
      >
        <div className="flex justify-center mb-2">
          {getIcon(node.roleTitle)}
        </div>

        <h3 className="text-white font-bold text-base text-center leading-5">
          {node.user
            ? `${node.user.firstName} ${node.user.lastName}`
            : "Vacant"}
        </h3>

        <p className="text-white/80 text-sm text-center mt-1">
          {node.roleTitle}
        </p>
      </div>

      {/* Children */}
      {node.reports?.length > 0 && (
        <>
          {/* Vertical Line */}
          <div
            className="w-[2px] h-8"
            style={{
              background: colors.cardBorder,
            }}
          />

          {/* Children Container */}
          <div className="relative flex flex-wrap justify-center gap-4 max-w-[1200px]">
            {/* Horizontal Line */}
            <div
              className="absolute top-0 left-6 right-6 h-[2px]"
              style={{
                background: colors.cardBorder,
              }}
            />

            {node.reports.map((child) => (
              <div
                key={child._id}
                className="relative flex flex-col items-center pt-5"
              >
                {/* Child Vertical Line */}
                <div
                  className="absolute top-0 w-[2px] h-5"
                  style={{
                    background: colors.cardBorder,
                  }}
                />

                <OrgNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}