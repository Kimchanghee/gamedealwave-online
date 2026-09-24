export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="mb-4 font-semibold text-blue-300">404</p>
        <h1 className="mb-4 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="mb-4 text-slate-300">
          요청하신 주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.
        </p>
        <a href="/en/" className="text-blue-300" style={{ textDecoration: 'underline' }}>
          GameDealWave 홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}
