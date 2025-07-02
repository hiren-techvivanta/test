import React from "react";
import SideNav from "../../components/SideNav";
import Charts from "../../components/Charts";
import TopNav from "../../components/TopNav";

const Dashboard = () => {
  return (
    <>
      <div className="container-fluid p-0 m-0">
        <TopNav />
        <div className="row m-0">
          <div
            className="col-3 p-0"
            style={{ maxHeight: "100%", overflowY: "auto" }}
          >
            <SideNav />
          </div>
          <div className="col-9">
            <div className="container-fluid p-0">
              <div className="row m-0">
                <div
                  className="col-12 py-3"
                  style={{ background: "#EEEEEE", minHeight: "93vh" }}
                >
                  <div className="frame-1597880849">
                    <div className="all-members-list">Dashboard</div>
                  </div>
                  <div className="card shadow border-0 mt-4">
                    <div className="card-body">
                      <div className="row g-3 g-xl-4">
                        <div className="col-12">
                          <div className="overflow-auto">
                            <p>Not functional</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

//  <div className="container py-5 mb-lg-4 ">
//   <div className="row pt-sm-2 pt-lg-0">
//     <SideNav />

//     <div className="col-lg-9 pt-4 pb-2 pb-sm-4">
//       <div className="d-sm-flex align-items-center mb-4">
//         <h1 className="h2 mb-4 mb-sm-0 me-4">Dashboard</h1>
//       </div>
//       <div className="card shadow border-0">
//         <div className="card-body">
//           {/* <!-- Stats --> */}
//           <div className="row g-3 g-xl-4">
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Recharges</h2>
//                 <div className="h4 text-primary mb-2">$842.00 / $1.00k</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 2% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 1.37% from last month</span>
//                 </p>
//               </div>
//             </div>
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Users</h2>
//                 <div className="h4 text-primary mb-2">500.00 / 2.7M</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-danger">- 32% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 5% from last month</span>
//                 </p>
//               </div>
//             </div>
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Bank Transfer</h2>
//                 <div className="h4 text-primary mb-2">$48.00K / $1.00B</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 200% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 5% from last month</span>
//                 </p>
//               </div>
//             </div>
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Wave Virtual Card</h2>
//                 <div className="h4 text-primary mb-2">50 / 2.47k</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 3% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-danger">- 1.67% from last month</span>
//                 </p>
//               </div>
//             </div>
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Wave Physical Card</h2>
//                 <div className="h4 text-primary mb-2">50 / 2.47k</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 3% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-danger">- 1.67% from last month</span>
//                 </p>
//               </div>
//             </div>
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Deposit</h2>
//                 <div className="h4 text-primary mb-2">$30.00K / $70.00M</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 158% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 15873% from last month</span>
//                 </p>
//               </div>
//             </div>
//             <div className="col-md-4 col-sm-6 d-card">
//               <div className="h-100 bg-secondary rounded-3 text-center p-4">
//                 <h2 className="h6 pb-2 mb-1">Withdrawal</h2>
//                 <div className="h4 text-primary mb-2">$20k / 100.00M</div>
//                 <br />
//                 <p className="fs-sm mb-0">
//                   <span className="text-danger">- 3% from yesterday</span>
//                 </p>
//                 <p className="fs-sm mb-0">
//                   <span className="text-success">+ 1007% from last month</span>
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="row g-4 py-4"></div>
//           <div className="row g-4"></div>
//         </div>
//       </div>
//       <div className="card shadow border-0 mt-5">
//         <div className="card-body">
//           <Charts />
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
