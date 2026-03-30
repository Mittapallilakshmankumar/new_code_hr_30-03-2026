export default function ContentCard({ title, children, rightContent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {rightContent ? <div>{rightContent}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
