import React from "react";
import SideNav from "../../components/SideNav";
import Charts from "../../components/Charts";

const Dashboard = () => {
  return (
    <>
      <div className="container py-5 mb-lg-4 ">
        <div className="row pt-sm-2 pt-lg-0">
          <SideNav />

          <div class="col-lg-9 pt-4 pb-2 pb-sm-4">
            <div class="d-sm-flex align-items-center mb-4">
              <h1 class="h2 mb-4 mb-sm-0 me-4">Dashboard</h1>
            </div>
            <div class="card shadow border-0">
              <div class="card-body">
                {/* <!-- Stats --> */}
                <div class="row g-3 g-xl-4">
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Recharges</h2>
                      <div class="h4 text-primary mb-2">$842.00 / $1.00k</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 2% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 1.37% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Users</h2>
                      <div class="h4 text-primary mb-2">500.00 / 2.7M</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-danger">
                          - 32% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 5% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Bank Transfer</h2>
                      <div class="h4 text-primary mb-2">$48.00K / $1.00B</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 200% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 5% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Wave Virtual Card</h2>
                      <div class="h4 text-primary mb-2">50 / 2.47k</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 3% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-danger">
                          - 1.67% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Wave Physical Card</h2>
                      <div class="h4 text-primary mb-2">50 / 2.47k</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 3% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-danger">
                          - 1.67% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Deposit</h2>
                      <div class="h4 text-primary mb-2">$30.00K / $70.00M</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 158% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 15873% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-6 d-card">
                    <div class="h-100 bg-secondary rounded-3 text-center p-4">
                      <h2 class="h6 pb-2 mb-1">Withdrawal</h2>
                      <div class="h4 text-primary mb-2">$20k / 100.00M</div>
                      <br />
                      <p class="fs-sm mb-0">
                        <span className="text-danger">
                          - 3% from yesterday
                        </span>
                      </p>
                      <p class="fs-sm mb-0">
                        <span className="text-success">
                          + 1007% from last month
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="row g-4 py-4"></div>
                <div class="row g-4"></div>
              </div>
            </div>
            <div class="card shadow border-0 mt-5">
              <div class="card-body">
                <Charts />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
