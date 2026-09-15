/** Blueprint signature: four 14px L-shaped hairlines at the corners of a box. */
export default function Corners() {
  return (
    <span className="corners" aria-hidden="true">
      <i className="corners__tl" />
      <i className="corners__tr" />
      <i className="corners__bl" />
      <i className="corners__br" />
    </span>
  );
}
