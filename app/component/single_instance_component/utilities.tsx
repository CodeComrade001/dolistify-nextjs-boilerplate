"use client";

import React, { useEffect, useState } from "react";
import calendarStyle from "../../styles/calenderStyle.module.css"; // Ensure correct spelling

export default function Calendar(): JSX.Element {
   return (
      <div className={calendarStyle.datepicker}>
         <div className={calendarStyle.datepicker_top}>
            <div className={calendarStyle.btn_group}>
               <button className={calendarStyle.tag}>Today</button>
               <button className={calendarStyle.tag}>Tomorrow</button>
               <button className={calendarStyle.tag}>In 2 days</button>
            </div>
            <div className={calendarStyle.month_selector}>
               <button className={calendarStyle.arrow}><i className={calendarStyle.svg_icon}>left</i></button>
               <span className={calendarStyle.month_name}>December 2020</span>
               <button className={calendarStyle.arrow}><i className={calendarStyle.svg_icon}>right</i></button>
            </div>
         </div>
         <div className={calendarStyle.datepicker_calendar}>
            <div className={calendarStyle.day_container}>
               <span className={calendarStyle.day}>Mo</span>
               <span className={calendarStyle.day}>Tu</span>
               <span className={calendarStyle.day}>We</span>
               <span className={calendarStyle.day}>Th</span>
               <span className={calendarStyle.day}>Fr</span>
               <span className={calendarStyle.day}>Sa</span>
               <span className={calendarStyle.day}>Su</span>
            </div>

            <div className={calendarStyle.date_container}>
               <button className={`${calendarStyle.date} ${calendarStyle.faded}`}>30</button>
               <button className={calendarStyle.date}>1</button>
               <button className={calendarStyle.date}>2</button>
               <button className={calendarStyle.date}>3</button>
               <button className={calendarStyle.date}>4</button>
               <button className={calendarStyle.date}>5</button>
               <button className={calendarStyle.date}>6</button>
               <button className={calendarStyle.date}>7</button>
               <button className={calendarStyle.date}>8</button>
               <button className={`${calendarStyle.date} ${calendarStyle.current_day}`}>9</button>
               <button className={calendarStyle.date}>10</button>
               <button className={calendarStyle.date}>11</button>
               <button className={calendarStyle.date}>12</button>
               <button className={calendarStyle.date}>13</button>
               <button className={calendarStyle.date}>14</button>
               <button className={calendarStyle.date}>15</button>
               <button className={calendarStyle.date}>16</button>
               <button className={calendarStyle.date}>17</button>
               <button className={calendarStyle.date}>18</button>
               <button className={calendarStyle.date}>19</button>
               <button className={calendarStyle.date}>20</button>
               <button className={calendarStyle.date}>21</button>
               <button className={calendarStyle.date}>22</button>
               <button className={calendarStyle.date}>23</button>
               <button className={calendarStyle.date}>24</button>
               <button className={calendarStyle.date}>25</button>
               <button className={calendarStyle.date}>26</button>
               <button className={calendarStyle.date}>27</button>
               <button className={calendarStyle.date}>28</button>
               <button className={calendarStyle.date}>29</button>
               <button className={calendarStyle.date}>30</button>
               <button className={calendarStyle.date}>31</button>
               <button className={`${calendarStyle.date} ${calendarStyle.faded}}`}> 1</button >
               <button className={`${calendarStyle.date} ${calendarStyle.faded}}`}>2</button>
               <button className={`${calendarStyle.date} ${calendarStyle.faded}}`}>3</button>
            </div>
         </div >
      </div >
   );
};

