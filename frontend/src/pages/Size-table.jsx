import React from 'react';
import './Size-table.css';

export default function SizeTable() {
    return (
        <div className="main-container">
            <div className='container'>
                <div className='p-5'>
                    <h2 className='text-center mt-3 mb-3 fst-italic'>Maison Size Measurement</h2>
                </div>
                <div className='p-3'>
                    <p className='text-center fst-italic'>" Our maison stands out for its tailoring excellence and the meticulous attention dedicated to the fit of every single garment. The following size chart has been developed to provide a precise and reliable guide to our standard sizes, designed for heights between 166 and 172 cm.
                        We invite our valued clientele to consult it carefully, in order to identify the most appropriate size and guarantee a purchasing experience in line with the high-quality standards that distinguish us. Each measurement has been designed to enhance the figure, blending comfort and aesthetic refinement. "</p>
                </div>
                <div className='table-container'>

                    <table className="table-color table table-bordered table-striped text-center">
                        <tbody>
                            <tr>
                                <td colSpan={8}>
                                    <strong>Measurements and Fit, height 166 - 172 cm</strong>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2"><strong>Sizes</strong></td>
                                <td>XS</td>
                                <td>S</td>
                                <td>M</td>
                                <td>L</td>
                                <td>XL</td>
                            </tr>
                            <tr>
                                <td colSpan="2">USA</td>
                                <td>4</td>
                                <td>6</td>
                                <td>8</td>
                                <td>10</td>
                                <td>12</td>
                            </tr>
                            <tr>
                                <td colSpan="2">EUR</td>
                                <td>38</td>
                                <td>40</td>
                                <td>42</td>
                                <td>44</td>
                                <td>46</td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Chest (CM)</td>
                                <td>84-86</td>
                                <td>88 - 90 </td>
                                <td>92 - 94 </td>
                                <td>96 - 98</td>
                                <td>100 - 102</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td> Waist (CM)</td>
                                <td>64 - 66</td>
                                <td>68 - 70</td>
                                <td>72 - 74</td>
                                <td>76 - 78</td>
                                <td>80 - 84</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td> Hip (CM)</td>
                                <td>90 - 92</td>
                                <td>94 - 96</td>
                                <td>98 - 100</td>
                                <td>102 - 104</td>
                                <td>106 - 108</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td> Shoulders (CM)</td>
                                <td>38 - 39</td>
                                <td>39 - 40</td>
                                <td>39 - 40</td>
                                <td>40 - 41</td>
                                <td>40 - 41</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td> Bicep (CM)</td>
                                <td>26 - 28</td>
                                <td>28 - 30</td>
                                <td>30 - 32</td>
                                <td>32 - 34</td>
                                <td>34 - 36</td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td> Arm Length (CM)</td>
                                <td>58 - 61</td>
                                <td>58 - 61</td>
                                <td>58 - 61</td>
                                <td>58 - 61</td>
                                <td>58 - 61</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='continer mt-5 mb-5'>

                <div className="row g-3">
                    <div className="col-6 col-sm-4 col-md-2">
                        <div className="card">
                            <img src="./img/Size-1.png" alt="" />
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 col-md-2">
                        <div className="card">
                            <img src="./img/Size-2.png" alt="" />
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 col-md-2">
                        <div className="card">
                            <img src="./img/Size-3.png" alt="" />
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 col-md-2">
                        <div className="card">
                            <img src="./img/Size-4.png" alt="" />
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 col-md-2">
                        <div className="card">
                            <img src="./img/Size-5.png" alt="" />
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 col-md-2 ">
                        <div className="card">
                            <img src="./img/Size-6.png" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}